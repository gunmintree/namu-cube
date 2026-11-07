import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
const errors = [];
async function walk(dir) {
  const files = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(files.map(file => file.isDirectory() ? walk(path.join(dir, file.name)) : path.join(dir, file.name)))).flat();
}
const htmlFiles = (await walk(root)).filter(file => file.endsWith('.html'));
const pages = new Map(await Promise.all(htmlFiles.map(async file => [file, await readFile(file, 'utf8')])));
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)].map(match => [match[1].toLowerCase(), match[3].replaceAll('&amp;', '&')]));
for (const [file, html] of pages) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  const route = relative === 'index.html' ? '/' : relative.endsWith('/index.html') ? `/${relative.slice(0, -10)}` : `/${relative}`;
  const fail = message => errors.push(`${route}: ${message}`);
  if (/href=["']https?:\/\/(?:localhost|127\.0\.0\.1)(?::|\/|["'])/i.test(html)) fail('local development link present in production output');
  const locale = route.startsWith('/en/') ? 'en' : 'ko';
  if (attributes(html.match(/<html\b[^>]*>/i)?.[0] ?? '').lang !== locale) fail(`expected html lang=${locale}`);
  if ([...html.matchAll(/<h1\b/gi)].length !== 1) fail('expected exactly one h1');
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1] ?? '';
  if (!title.trim() || (locale === 'en' ? !title.includes('Namu Tree') : !/[가-힣]/.test(title))) fail('missing localized title');
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map(match => attributes(match[0]));
  const description = metas.find(meta => meta.name === 'description')?.content;
  if (!description?.trim() || (locale === 'ko' && !/[가-힣]/.test(description))) fail('missing localized description');
  const ids = [...html.matchAll(/\bid\s*=\s*(["'])(.*?)\1/g)].map(match => match[2]);
  if (new Set(ids).size !== ids.length) fail('duplicate IDs');
  for (const match of html.matchAll(/<(a|link|script|img)\b[^>]*>/gi)) {
    const attrs = attributes(match[0]);
    if (attrs.rel === 'canonical' && !process.env.SITE_URL) fail('canonical present without verified SITE_URL');
    if (attrs.rel === 'canonical' && process.env.SITE_URL && new URL(attrs.href).origin !== new URL(process.env.SITE_URL).origin) fail('canonical points outside verified SITE_URL');
    const reference = attrs.href ?? attrs.src;
    if (!reference || /^(mailto:|tel:|data:|javascript:)/i.test(reference)) continue;
    const url = new URL(reference, `https://local.test${route}`);
    if (url.origin !== 'https://local.test') continue;
    const decoded = decodeURIComponent(url.pathname);
    let target = path.join(root, decoded);
    try {
      if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
      await stat(target);
    } catch { fail(`missing target ${reference}`); continue; }
    if (url.hash && pages.has(target)) {
      const targetHtml = pages.get(target);
      const targetIds = [...targetHtml.matchAll(/\bid\s*=\s*(["'])(.*?)\1/g)].map(item => item[2]);
      if (!targetIds.includes(decodeURIComponent(url.hash.slice(1)))) fail(`missing fragment ${reference}`);
    }
  }
}
console.log(`Checked ${htmlFiles.length} built pages, links, fragments, locale metadata, headings, and canonical ownership.`);
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
