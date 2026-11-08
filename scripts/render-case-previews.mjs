import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import puppeteer from 'puppeteer-core';
import { allLessons } from '../src/content/lessons.ts';
import { solvedCube, applyAlgorithm, inverseAlgorithm } from '../src/lib/cube.ts';
import { stickerTransform } from '../src/lib/presentation.ts';

// 시연과 같은 좌표·색상으로 정지 이미지를 만든다. 별도 서버는 필요 없다.
const directory = 'public/images/cases';
const tokens = await readFile('src/styles/tokens.css', 'utf8');
const palette = [...tokens.matchAll(/--cube-([UDFBRL]|line):\s*([^;]+);/g)].map(match => `--cube-${match[1]}:${match[2]};`).join('');
const style = `
  :root { ${palette} }
  * { box-sizing:border-box; }
  body { margin:0; background:transparent; }
  .scene { width:280px; height:260px; perspective:1000px; }
  .cube { position:absolute; left:140px; top:124px; transform-style:preserve-3d; transform:rotateX(-26deg) rotateY(-34deg) scale(.96); }
  .sticker { position:absolute; left:-29px; top:-29px; width:58px; height:58px; border:3px solid var(--cube-line); border-radius:7px; backface-visibility:hidden; box-shadow:inset 0 2px 2px #ffffff40,inset 0 -2px 2px #00000018; }
`;
const previews = allLessons.flatMap(lesson => lesson.cases.map(item => {
  const state = applyAlgorithm(applyAlgorithm(solvedCube(), item.targetSetup ?? ''), inverseAlgorithm(item.moves));
  return { file: `${lesson.slug}-${item.id}.png`, stickers: state.map(sticker => ({ transform: stickerTransform(sticker), color: sticker.color })) };
}));
const signature = createHash('sha256').update(JSON.stringify({ style, previews })).digest('hex');
if (process.argv.includes('--check')) {
  const manifest = JSON.parse(await readFile(`${directory}/manifest.json`, 'utf8'));
  if (manifest.signature !== signature) throw new Error('사례 이미지가 현재 데이터와 다릅니다. npm run render:cases를 실행하세요.');
  for (const preview of previews) {
    const bytes = await readFile(`${directory}/${preview.file}`);
    if (manifest.files[preview.file] !== createHash('sha256').update(bytes).digest('hex')) throw new Error(`사례 이미지가 변경되거나 손상됐습니다: ${preview.file}`);
  }
  console.log(`사례 이미지 ${previews.length}개의 원본 데이터와 파일을 확인했습니다.`);
} else {
  await mkdir(directory, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 280, height: 260, deviceScaleFactor: 2 });
    const files = {};
    for (const preview of previews) {
      await page.setContent(`<style>${style}</style><div class="scene"><div class="cube">${preview.stickers.map(sticker => `<span class="sticker" style="transform:${sticker.transform};background:var(--cube-${sticker.color})"></span>`).join('')}</div></div>`);
      const bytes = await page.screenshot({ path: `${directory}/${preview.file}`, omitBackground: true });
      files[preview.file] = createHash('sha256').update(bytes).digest('hex');
    }
    await writeFile(`${directory}/manifest.json`, `${JSON.stringify({ signature, files }, null, 2)}\n`);
    console.log(`사례 이미지 ${previews.length}개를 만들었습니다.`);
  } finally { await browser.close(); }
}
