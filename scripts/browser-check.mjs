import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { allLessons } from '../src/content/lessons.ts';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:4323';
const key = 'namutree:cube:progress';
const results = [];
await mkdir('artifacts', { recursive: true });
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true });
const page = await browser.newPage();
await page.setCacheEnabled(false);
const runtimeErrors = [];
page.on('pageerror', error => runtimeErrors.push(error.message));
const go = async route => {
  const response = await page.goto(new URL(route, base).href, { waitUntil: 'networkidle0' });
  assert.equal(response.status(), 200, route);
};
async function check(name, action) {
  if (process.env.CHECK_FILTER && !process.env.CHECK_FILTER.split(',').some(filter => name.includes(filter.trim()))) return;
  try { await action(); results.push({ name, status: 'pass' }); console.log(`PASS ${name}`); }
  catch (error) { results.push({ name, status: 'fail', error: error.stack }); console.error(`FAIL ${name}: ${error.message}`); }
}
const count = () => page.$eval('[data-move-count]', element => Number(element.textContent.split('/')[0].trim()));
const ready = () => page.waitForFunction(() => !document.querySelector('[data-case]').disabled);
try {
  await check('visual preview: every case loads its rendered starting image without following playback', async () => {
    for (const lesson of allLessons) {
      await go(`/learn/${lesson.slug}/`); await ready();
      assert.ok(await page.$('[data-case-preview]'), '사례의 시작 그림이 있다');
      for (const item of lesson.cases) {
        await page.select('[data-case]', item.id);
        await page.$eval('[data-case-preview]', element => element.decode());
        const image = await page.$eval('[data-case-preview]', element => ({ src: element.getAttribute('src'), width: element.naturalWidth, alt: element.alt }));
        assert.equal(image.src, `/images/cases/${lesson.slug}-${item.id}.png`);
        assert.equal(image.width, 560, '고해상도 이미지가 실제로 로드된다');
        assert.ok(image.alt.includes(item.title.ko), '선택된 사례의 대체 설명을 제공한다');
      }
      const before = await page.$eval('[data-case-preview]', element => element.src);
      assert.equal(await page.$eval('.checkpoint-status', element => element.hidden), true, '시작 조건을 시연 상태에서 중복 표시하지 않는다');
      await page.click('[data-next]'); await ready();
      assert.equal(await page.$eval('[data-case-preview]', element => element.src), before, '시작 그림은 시연 진행 중에도 고정된다');
      assert.equal(await page.$eval('.checkpoint-status', element => element.hidden), false, '동작 후에는 확인 지점을 표시한다');
    }
  });
  await check('player: the first checkpoint keeps mobile playback controls in place', async () => {
    await page.setViewport({ width: 390, height: 844 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    for (const route of ['/learn/white-cross/', '/en/learn/white-corners/']) {
      await go(route); await ready();
      // 다음 동작을 계속 누르는 상황을 확인한다. 종료 안내로 바뀌는 단일 동작은 제외한다.
      if (route.includes('white-cross')) await page.select('[data-case]', 'align-first');
      const position = () => page.$eval('[data-next]', element => element.getBoundingClientRect().top + scrollY);
      const before = await position();
      await page.click('[data-next]'); await ready();
      assert.ok(Math.abs(await position() - before) < 2, '확인 지점이 나타나도 한 동작 버튼의 문서 내 위치가 유지된다');
      assert.equal(await page.$eval('.checkpoint-status', element => element.hidden), false);
    }
    await page.emulateMediaFeatures([]);
  });
  await check('journey: bilingual starting points follow the main course', async () => {
    for (const prefix of ['', '/en']) {
      await go(`${prefix}/`);
      assert.ok(await page.$('[data-stage-finder]'), '시작 지점을 찾는 영역이 있다');
      assert.ok(await page.$('[data-find-start]'), '첫 시작 버튼 가까이에 시작 지점 찾기 링크가 있다');
      await page.click('[data-find-start]');
      assert.equal(await page.$eval('[data-stage-finder]', element => element.open), true, '시작 지점 링크가 안내를 직접 펼친다');
      assert.deepEqual(await page.$$eval('[data-entry-slug]', elements => elements.map(element => element.getAttribute('href'))), ['white-cross','white-corners','middle-layer','yellow-cross','yellow-edges','yellow-corners','finish'].map(slug => `${prefix}/learn/${slug}/`));
      assert.equal((await page.$$('[data-entry-slug] p')).length, 7, '각 선택에 실물 시작 조건이 있다');
    }
  });
  await check('journey: progress counts only personally checked main lessons', async () => {
    await go('/');
    await page.evaluate(storageKey => localStorage.setItem(storageKey, JSON.stringify({ version: 1, lastSlug: 'ready', completed: ['ready','daisy','white-cross','middle-layer'] })), key);
    await go('/');
    assert.ok(await page.$('[data-course-progress]'), '본 수업 진행 표시가 있다');
    assert.deepEqual(await page.$eval('[data-course-progress] progress', element => ({ value: element.value, max: element.max })), { value: 2, max: 7 });
    assert.match(await page.$eval('[data-progress-count]', element => element.textContent), /2\s*\/\s*7/);
    await page.evaluate(storageKey => localStorage.removeItem(storageKey), key);
  });
  await check('journey: case and grip precede the demonstration at both widths', async () => {
    for (const width of [320, 1280]) {
      await page.setViewport({ width, height: 900 });
      await go('/en/learn/middle-layer/'); await ready();
      assert.ok(await page.$('.lesson-preparation'), '시연 전 준비 영역이 있다');
      assert.equal(await page.evaluate(() => {
        const visual = document.querySelector('.lesson-visual').getBoundingClientRect();
        return ['.case-choice', '.hold-instruction'].every(selector => document.querySelector(selector).getBoundingClientRect().bottom <= visual.top);
      }), true);
      const options = await page.$$eval('[data-case] option', elements => elements.map(element => element.value));
      const before = await page.$eval('[data-case-when]', element => element.textContent);
      await page.select('[data-case]', options[1]);
      assert.notEqual(await page.$eval('[data-case-when]', element => element.textContent), before);
      const expectedGrip = await page.evaluate(() => {
        const data = JSON.parse(document.querySelector('#lesson-data').textContent);
        return data.lesson.cases.find(item => item.id === document.querySelector('[data-case]').value).hold.en;
      });
      assert.equal(await page.$eval('[data-case-hold]', element => element.textContent), expectedGrip);
    }
  });
  await check('journey: opening recovery stops playback and keeps final-layer guidance', async () => {
    await page.setViewport({ width: 1280, height: 900 });
    await go('/en/learn/finish/'); await ready();
    assert.ok(await page.$('[data-recovery]'), '막힘 복구 영역이 있다');
    await page.click('[data-play]');
    await page.click('.recovery-link');
    assert.equal(await page.$eval('[data-recovery]', element => element.open), true, '막힘 링크가 복구 안내를 직접 펼친다');
    await ready();
    assert.notEqual(await page.$eval('[data-play]', element => element.textContent), 'Pause');
    const paused = await count();
    await new Promise(resolve => setTimeout(resolve, 950));
    assert.equal(await count(), paused);
    assert.match(await page.$eval('[data-recovery]', element => element.textContent), /lower layers/i);
    assert.match(await page.$eval('[data-recovery]', element => element.textContent), /only the screen/i);
    assert.equal(await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)).completed.includes('finish'), key), false, '복구와 재생은 실물 완료를 기록하지 않는다');
  });
  await check('journey: no-script starting points and recovery remain readable', async () => {
    const plain = await browser.newPage();
    try {
      await plain.setJavaScriptEnabled(false);
      await plain.goto(new URL('/en/', base).href, { waitUntil: 'networkidle0' });
      assert.equal(await plain.$eval('[data-course-progress]', element => element.hidden), true, '불러오지 못한 기록을 0개로 단정하지 않는다');
      await plain.click('[data-find-start]');
      assert.equal(await plain.$eval('[data-stage-finder]', element => element.open), true);
      assert.equal((await plain.$$('[data-entry-slug]')).length, 7);
      await plain.goto(new URL('/en/learn/finish/', base).href, { waitUntil: 'networkidle0' });
      await plain.click('[data-recovery] > summary');
      assert.match(await plain.$eval('[data-recovery]', element => element.innerText), /lower layers/i);
    } finally { await plain.close(); }
  });
  await check('journey: re-entering open recovery pauses restarted playback', async () => {
    await page.setViewport({ width: 1280, height: 900 });
    await go('/en/learn/finish/'); await ready();
    await page.click('.recovery-link');
    assert.equal(await page.$eval('[data-recovery]', element => element.open), true);
    await page.click('[data-recovery] a[href="#cube-practice"]');
    await page.click('[data-play]');
    await page.click('.recovery-link');
    await ready();
    assert.notEqual(await page.$eval('[data-play]', element => element.textContent), 'Pause');
    const paused = await count();
    await new Promise(resolve => setTimeout(resolve, 950));
    assert.equal(await count(), paused);
  });
  for (const width of [320, 360, 390, 768, 1280]) {
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    for (const route of ['/', '/en/', '/learn/white-cross/', '/learn/white-corners/', '/learn/yellow-cross/', '/en/learn/yellow-edges/', '/en/learn/finish/']) {
      await check(`layout ${width} ${route}`, async () => {
        await go(route);
        const problems = await page.evaluate(() => {
          const failures = [];
          if (document.documentElement.scrollWidth > innerWidth + 1) failures.push(`document ${document.documentElement.scrollWidth} > ${innerWidth}`);
          // 회전된 입체 스티커의 경계 상자는 화면 버튼 검사에서 제외한다.
          for (const element of document.querySelectorAll('button, select, a.button')) {
            if (!element.getClientRects().length) continue;
            const rect = element.getBoundingClientRect();
            if (rect.left < -1 || rect.right > innerWidth + 1) failures.push(`${element.textContent.trim()} outside viewport`);
            if (element.scrollWidth > element.clientWidth + 2) failures.push(`${element.textContent.trim()} text clipped`);
          }
          return failures;
        });
        assert.deepEqual(problems, []);
        if ([390, 1280].includes(width)) await page.screenshot({ path: `artifacts/${route === '/' ? 'home' : route.replaceAll('/', '-').replace(/^-|-$/g, '')}-${width}.png`, fullPage: true });
      });
    }
  }
  await page.setViewport({ width: 1280, height: 900 });
  await check('learning starts with the cross and preparation remains optional', async () => {
    await go('/');
    assert.equal(await page.$eval('.hero-actions a.primary', element => element.getAttribute('href')), '/learn/white-cross/');
    assert.deepEqual(await page.$$eval('.lesson-list a', elements => elements.map(element => element.getAttribute('href'))), ['white-cross','white-corners','middle-layer','yellow-cross','yellow-edges','yellow-corners','finish'].map(slug => `/learn/${slug}/`));
    await go('/learn/white-cross/'); await ready();
    assert.ok(await page.$('.lesson-preparation a[href="/learn/daisy/"]'), '흰 조각 모으기는 준비 영역의 선택 가능한 도움말이다');
    assert.equal(await page.$eval('.goal-preview', element => element.getBoundingClientRect().bottom <= innerHeight), true);
    assert.doesNotMatch(await page.$eval('main', element => element.innerText), /보호자/);
    await go('/learn/daisy/'); await ready();
    assert.equal(await page.$eval('[data-complete]', element => element.getAttribute('href')), '/learn/white-cross/');
  });
  await check('bottom view reveals white without changing the cube state', async () => {
    await go('/learn/white-cross/'); await ready();
    const before = await page.$eval('.cube-body', element => element.innerHTML);
    await page.click('[data-tilt="28"]');
    assert.ok((await page.$eval('.cube-body', element => element.style.transform)).includes('rotateX(28deg)'));
    assert.equal(await page.$eval('.cube-body', element => element.innerHTML), before);
  });
  await check('coaching: bottom toggle restores the exact previous view', async () => {
    await go('/learn/white-cross/'); await ready();
    await page.click('.view-disclosure > summary');
    await page.click('[data-view="148"]');
    const original = await page.$eval('.cube-body', element => element.style.transform);
    const stickers = await page.$eval('.cube-body', element => element.innerHTML);
    await page.click('[data-bottom]');
    assert.equal(await page.$eval('[data-bottom]', element => element.getAttribute('aria-pressed')), 'true');
    await page.click('[data-bottom]');
    assert.equal(await page.$eval('.cube-body', element => element.style.transform), original);
    assert.equal(await page.$eval('.cube-body', element => element.innerHTML), stickers);
    assert.equal(await page.$eval('[data-view="148"]', element => element.getAttribute('aria-pressed')), 'true');
  });
  await check('formula: the readable formula stays next to the cube', async () => {
    await go('/learn/yellow-cross/'); await ready();
    const formula = await page.$('[data-formula-guide]');
    assert.ok(formula, '기호와 뜻을 함께 읽는 공식 영역');
    assert.deepEqual(await page.$$eval('[data-formula-token] [data-symbol]', elements => elements.map(element => element.textContent)), ['F', 'R', 'U', 'R′', 'U′', 'F′']);
    assert.equal((await page.$$('[data-formula-token] [data-meaning]')).length, 0, '기호 아래의 면 이름·방향은 제거한다');
    const positions = await page.evaluate(() => ({ formula: document.querySelector('[data-formula-guide]').getBoundingClientRect().bottom, cube: document.querySelector('[data-orbit]').getBoundingClientRect().top }));
    assert.ok(positions.formula <= positions.cube, '공식은 큐브 바로 위에 있다');
    await page.select('[data-case]', 'dot');
    assert.equal((await page.$$('[data-formula-token]')).length, 6, '반복 공식은 한 번만 표시한다');
    assert.match(await page.$eval('[data-formula-summary]', element => element.textContent), /3/);
    await (await page.$('.lesson-visual')).screenshot({ path: 'artifacts/formula-player-desktop.png' });
  });
  await check('formula: current symbol, alignment, and group replay stay synchronized', async () => {
    await go('/en/learn/yellow-cross/'); await ready();
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.select('[data-case]', 'dot');
    assert.equal(await page.$eval('[data-active-move]', element => element.textContent), 'F');
    await page.click('[data-next]'); await ready();
    assert.equal(await page.$eval('[data-active-move]', element => element.textContent), 'R');
    await page.click('[data-replay-group]');
    await page.waitForFunction(() => document.querySelector('[data-move-count]').textContent.startsWith('6 /'));
    assert.equal(await page.$eval('[data-active-move]', element => element.textContent), 'U2');
    assert.equal(await page.$eval('[data-alignment]', element => element.hidden), false);
    assert.equal((await page.$$('[data-formula-token][aria-current]')).length, 0);
    await page.click('[data-next]'); await ready();
    assert.equal(await page.$eval('[data-active-move]', element => element.textContent), 'F');
    assert.equal(await page.$eval('[data-alignment]', element => element.hidden), true);
    assert.equal((await page.$$('[data-formula-token][aria-current]')).length, 1);
  });
  await check('formula: recall mode hides symbols and clues without moving the cube', async () => {
    await go('/en/learn/white-corners/'); await ready();
    const stickers = await page.$eval('.cube-body', element => element.innerHTML);
    await page.click('[data-formula-hide]');
    assert.equal(await page.$eval('[data-active-move]', element => element.textContent), '?');
    assert.equal(await page.$$eval('[data-formula-token] [data-symbol]', elements => elements.every(element => element.hidden)), true);
    assert.doesNotMatch(await page.$eval('[data-move-copy]', element => element.textContent), /clockwise|counterclockwise/);
    assert.equal(await page.$eval('.cube-body', element => element.innerHTML), stickers);
    await page.select('[data-case]', 'white-up');
    assert.equal(await page.$eval('[data-formula-hide]', element => element.checked), true);
    await page.click('[data-formula-hide]');
    assert.equal(await page.$eval('[data-active-move]', element => element.textContent), 'R');
    assert.match(await page.$eval('[data-move-copy]', element => element.textContent), /clockwise/);
  });
  await check('formula: a mobile reference appears while reading and returns to the cube', async () => {
    await page.setViewport({ width: 390, height: 900 });
    await go('/learn/yellow-cross/'); await ready();
    await page.select('[data-case]', 'dot');
    await (await page.$('.lesson-visual')).screenshot({ path: 'artifacts/formula-player-mobile.png' });
    await page.evaluate(() => window.scrollTo(0, scrollY + document.querySelector('[data-formula-guide]').getBoundingClientRect().bottom + 16));
    await page.waitForFunction(() => !document.querySelector('[data-formula-dock]').hidden);
    assert.equal((await page.$$('[data-dock-formula] span')).length, 6);
    assert.equal(await page.$eval('[data-formula-dock]', element => element.getBoundingClientRect().right <= innerWidth), true);
    await page.click('[data-return-to-cube]');
    await page.waitForFunction(() => document.querySelector('[data-formula-dock]').hidden);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'cube-practice');
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForFunction(() => document.querySelector('[data-formula-dock]').hidden);
    await page.setViewport({ width: 1280, height: 900 });
  });
  await check('formula: copying uses the exact base formula and offers a denied-permission fallback', async () => {
    const context = browser.defaultBrowserContext();
    try {
      await context.overridePermissions(new URL(base).origin, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write']);
      await go('/en/learn/yellow-cross/'); await ready();
      await page.select('[data-case]', 'dot');
      await page.click('[data-formula-copy]');
      await page.waitForFunction(() => document.querySelector('[data-formula-copy-status]').textContent.includes('copied'));
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), "F R U R' U' F'");
      await context.overridePermissions(new URL(base).origin, []);
      await go('/en/learn/white-corners/'); await ready();
      await page.click('[data-formula-copy]');
      await page.waitForFunction(() => !document.querySelector('[data-copy-fallback]').hidden);
      assert.deepEqual(await page.$eval('[data-copy-text]', field => ({ value: field.value, selected: field.value.slice(field.selectionStart, field.selectionEnd) })), { value: "R U R' U'", selected: "R U R' U'" });
    } finally { await context.clearPermissionOverrides(); }
  });
  await check('coaching: drag and keyboard orbit leave moves and stickers intact', async () => {
    await page.bringToFront();
    await go('/en/learn/white-cross/'); await ready();
    const scene = await page.$('[data-orbit]');
    assert.ok(scene, 'focusable orbit area');
    await scene.scrollIntoView();
    const stickers = await page.$eval('.cube-body', element => element.innerHTML);
    const original = await page.$eval('.cube-body', element => getComputedStyle(element).transform);
    const box = await scene.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 70, box.y + box.height / 2 + 25, { steps: 6 });
    await page.mouse.up();
    assert.notEqual(await page.$eval('.cube-body', element => getComputedStyle(element).transform), original);
    await scene.focus();
    assert.equal(await page.evaluate(() => document.activeElement.matches('[data-orbit]')), true);
    await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Home');
    await page.waitForFunction(() => document.querySelector('.cube-body').style.transform === 'rotateX(-24deg) rotateY(-32deg)');
    assert.equal(await page.$eval('.cube-body', element => getComputedStyle(element).transform), original);
    assert.equal(await page.$eval('.cube-body', element => element.innerHTML), stickers);
    assert.equal(await count(), 0);
  });
  await check('coaching: yellow dot pauses at each pattern and alignment', async () => {
    await go('/en/learn/yellow-cross/'); await ready();
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.select('[data-case]', 'dot');
    for (const stop of [6, 7, 13, 19]) {
      await page.click('[data-play]');
      await page.waitForFunction(expected => Number(document.querySelector('[data-move-count]').textContent.split('/')[0]) === expected && document.querySelector('[data-play]').textContent !== 'Pause', {}, stop);
      assert.ok((await page.$eval('[data-checkpoint-copy]', element => element.textContent)).length > 20);
      assert.equal((await page.$$('[data-case-phases] [aria-current="step"]')).length, 1);
      assert.equal(await page.$eval('.completion-check [data-complete]', element => element.textContent.includes('Checked')), true);
    }
    assert.equal(await page.$eval('[data-next]', element => element.disabled), true);
    assert.equal((await page.$$('[data-current-top] span')).length, 9);
    assert.equal((await page.$$('[data-edge-comparison] li')).length, 4);
  });
  await check('coaching: full final walkthrough includes the alignment and pauses', async () => {
    await go('/en/learn/finish/'); await ready();
    await page.select('[data-case]', 'complete-walkthrough');
    for (const stop of [8, 9, 17, 25, 26]) {
      // 다음 동작 버튼으로도 같은 확인 지점을 한 동작씩 통과한다.
      while (await count() < stop) { await page.click('[data-next]'); await ready(); }
      assert.ok((await page.$eval('[data-checkpoint-title]', element => element.textContent)).length > 0);
    }
    assert.equal(await page.$eval('[data-next]', element => element.disabled), true);
    assert.match(await page.$eval('[data-case-after]', element => element.textContent), /all six faces/);
  });
  await check('refinement: every final case reaches a visible solved example', async () => {
    await go('/en/learn/finish/'); await ready();
    assert.equal(await page.$eval('[data-case]', element => element.value), 'complete-walkthrough');
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    const finalCases = await page.$$eval('[data-case] option', options => options.map(option => option.value));
    assert.deepEqual(finalCases, ['complete-walkthrough', 'two-corners-front']);
    for (const id of finalCases) {
      await page.select('[data-case]', id);
      assert.equal(await page.$eval('[data-demo-complete]', element => element.hidden), true);
      while (await page.$eval('[data-next]', element => !element.disabled)) { await page.click('[data-next]'); await ready(); }
      assert.equal(await page.$eval('[data-demo-complete]', element => element.hidden), false);
      assert.match(await page.$eval('.cube-body', element => element.getAttribute('aria-label')), /six faces/);
    }
  });
  await check('refinement: theme follows the system and persists across lessons and languages', async () => {
    await page.evaluate(() => localStorage.removeItem('namutree:cube:theme'));
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    await go('/learn/finish/'); await ready();
    assert.ok(await page.$('[data-theme-toggle]'), '테마 전환 버튼');
    await page.waitForFunction(() => !document.querySelector('[data-theme-toggle]').disabled);
    assert.equal(await page.$eval('[data-theme-toggle]', button => button.getAttribute('aria-pressed')), 'true');
    const dark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await (await page.$('.lesson-visual')).screenshot({ path: 'artifacts/finish-dark-desktop.png' });
    await page.screenshot({ path: 'artifacts/finish-dark-full.png', fullPage: true });
    await page.setViewport({ width: 390, height: 900 });
    await (await page.$('.lesson-visual')).screenshot({ path: 'artifacts/finish-dark-mobile.png' });
    await page.setViewport({ width: 1280, height: 900 });
    await page.click('[data-theme-toggle]');
    assert.equal(await page.evaluate(() => localStorage.getItem('namutree:cube:theme')), 'light');
    assert.notEqual(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), dark);
    await go('/en/learn/yellow-cross/'); await ready();
    assert.equal(await page.$eval('html', element => element.dataset.mode), 'light');
    await page.click('[data-theme-toggle]');
    await go('/en/learn/finish/'); await ready();
    assert.equal(await page.$eval('html', element => element.dataset.mode), 'dark');
    assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), dark);
    await page.evaluate(() => localStorage.removeItem('namutree:cube:theme'));
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }, { name: 'prefers-reduced-motion', value: 'reduce' }]);
  });
  await check('refinement: 320px at 200 percent keeps navigation and continuation controls inside the viewport', async () => {
    await page.setViewport({ width: 320, height: 900 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    for (const route of ['/learn/finish/', '/en/learn/finish/']) {
      await go(route); await ready();
      await page.evaluate(async () => {
        document.documentElement.style.fontSize = '200%';
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      while (await count() < 8) { await page.click('[data-next]'); await ready(); }
      assert.deepEqual(await page.evaluate(() => [...document.querySelectorAll('.navigation a,.navigation button,.player-controls button')].filter(element => element.getClientRects().length).flatMap(element => {
        const rect = element.getBoundingClientRect();
        return rect.left < -1 || rect.right > innerWidth + 1 || element.scrollWidth > element.clientWidth + 2 ? [element.textContent.trim() || element.getAttribute('aria-label')] : [];
      })), [], route);
      const locale = route.startsWith('/en/') ? 'en' : 'ko';
      await (await page.$('.navigation')).screenshot({ path: `artifacts/zoom-${locale}-navigation.png` });
      await (await page.$('.player-controls')).screenshot({ path: `artifacts/zoom-${locale}-controls.png` });
    }
    await page.setViewport({ width: 1280, height: 900 });
  });
  await check('coaching: the last daisy petal pauses before freeing its destination', async () => {
    await page.setViewport({ width: 320, height: 900 });
    await go('/learn/daisy/'); await ready();
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.select('[data-case]', 'top-side');
    for (const stop of [1, 2, 3]) {
      await page.click('[data-play]');
      await page.waitForFunction(expected => Number(document.querySelector('[data-move-count]').textContent.split('/')[0]) === expected, {}, stop);
      assert.equal(await page.$eval('[data-play]', element => element.textContent), '묶음 재생');
    }
    assert.match(await page.$eval('[data-checkpoint-copy]', element => element.textContent), /기존 꽃잎은 유지/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    await page.screenshot({ path: 'artifacts/daisy-last-petal-320.png', fullPage: true });
    await page.setViewport({ width: 1280, height: 900 });
  });
  await check('coaching: two-axis touch orbit preserves scrolling outside the cube', async () => {
    const mobile = await browser.newPage();
    try {
      await mobile.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
      await mobile.goto(new URL('/learn/yellow-cross/', base).href, { waitUntil: 'networkidle0' });
      await mobile.waitForFunction(() => !document.querySelector('[data-case]').disabled);
      const scene = await mobile.$('[data-orbit]'); await scene.scrollIntoView();
      const box = await scene.boundingBox();
      const x = Math.round(box.x + box.width / 2), y = Math.round(box.y + box.height / 2);
      const initial = await mobile.$eval('.cube-body', element => element.style.transform);
      const stickers = await mobile.$eval('.cube-body', element => element.innerHTML);
      const client = await mobile.createCDPSession();
      await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      for (let step = 1; step <= 6; step++) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + step * 12, y }] });
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      assert.notEqual(await mobile.$eval('.cube-body', element => element.style.transform), initial);
      assert.equal(await mobile.$eval('.cube-body', element => element.innerHTML), stickers);
      const previousScroll = await mobile.evaluate(() => scrollY);
      const previousAngle = await mobile.$eval('.cube-body', element => element.style.transform);
      await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      for (let step = 1; step <= 6; step++) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - step * 15 }] });
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      assert.notEqual(await mobile.$eval('.cube-body', element => element.style.transform), previousAngle, '세로 쓸기도 큐브의 관찰 각도를 바꾼다');
      assert.equal(await mobile.evaluate(() => scrollY), previousScroll, '큐브 안에서 관찰할 때 페이지는 움직이지 않는다');
      assert.equal(await mobile.$eval('.cube-body', element => element.innerHTML), stickers);
      assert.ok((await mobile.$eval('[data-orbit]', element => getComputedStyle(element).touchAction)).includes('pinch-zoom'));
      assert.equal(await mobile.$eval('[data-orbit]', element => element.classList.contains('is-dragging')), false);
      // 큐브 바깥의 본문에서는 원래의 한 손가락 페이지 스크롤을 유지한다.
      await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 8, y }] });
      for (let step = 1; step <= 6; step++) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 8, y: y - step * 15 }] });
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await mobile.waitForFunction(previous => scrollY > previous + 20, {}, previousScroll);
      await client.detach();
    } finally { await mobile.close(); }
  });
  await check('optional reference visits preserve completed main lessons', async () => {
    await page.evaluate(storageKey => localStorage.setItem(storageKey, JSON.stringify({version:1,lastSlug:'ready',completed:['white-cross','white-corners']})), key);
    await go('/learn/middle-layer/'); await ready();
    const record = await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key);
    assert.deepEqual(record.completed, ['white-cross','white-corners']);
    await go('/learn/daisy/'); await ready();
    const reference = await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key);
    assert.equal(reference.lastSlug, 'daisy');
    assert.deepEqual(reference.completed, ['white-cross','white-corners']);
  });
  await check('next, previous, reset, and case selection', async () => {
    await go('/en/learn/white-corners/'); await ready();
    const initial = await page.$eval('.cube-body', element => element.innerHTML);
    await page.click('[data-next]'); await ready(); assert.equal(await count(), 1);
    assert.notEqual(await page.$eval('.cube-body', element => element.innerHTML), initial);
    await page.click('[data-previous]'); assert.equal(await count(), 0);
    assert.equal(await page.$eval('.cube-body', element => element.innerHTML), initial);
    await page.click('[data-next]'); await ready(); await page.click('[data-reset]'); assert.equal(await count(), 0);
    const options = await page.$$eval('[data-case] option', elements => elements.map(element => element.value));
    assert.ok(options.length > 1);
    const before = await page.$eval('[data-case-when]', element => element.textContent);
    await page.select('[data-case]', options[1]); assert.equal(await count(), 0);
    assert.notEqual(await page.$eval('[data-case-when]', element => element.textContent), before);
  });
  await check('view controls change view without changing stickers', async () => {
    if (await page.$('.view-disclosure')) await page.click('.view-disclosure > summary');
    const before = await page.$eval('.cube-body', element => element.innerHTML);
    await page.click('[data-view="148"]');
    assert.equal(await page.$eval('[data-view="148"]', element => element.getAttribute('aria-pressed')), 'true');
    assert.ok((await page.$eval('.cube-body', element => element.style.transform)).includes('148deg'));
    assert.equal(await page.$eval('.cube-body', element => element.innerHTML), before);
  });
  await check('play, pause, rapid next clicks, and replay remain coherent', async () => {
    await go('/en/learn/white-corners/'); await ready();
    await page.click('[data-play]');
    assert.equal(await page.$eval('[data-play]', element => element.textContent), 'Pause');
    await page.click('[data-play]'); await ready();
    const paused = await count(); await new Promise(resolve => setTimeout(resolve, 900)); assert.equal(await count(), paused);
    await page.click('[data-reset]');
    await page.$eval('[data-next]', button => { for (let i = 0; i < 20; i++) button.click(); });
    await ready(); assert.equal(await count(), 1);
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.click('[data-reset]');
    await page.click('[data-play]');
    await page.waitForFunction(() => { const [current, total] = document.querySelector('[data-move-count]').textContent.split('/').map(Number); return current === total; }, { timeout: 20000 });
    assert.equal(await page.$eval('[data-next]', element => element.disabled), true);
    await page.click('[data-reset]'); assert.equal(await count(), 0);
    const reduced = await page.evaluate(async () => {
      document.querySelector('[data-next]').click();
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return { count: Number(document.querySelector('[data-move-count]').textContent.split('/')[0]), animations: document.querySelector('.cube-body').getAnimations({ subtree: true }).length };
    });
    assert.deepEqual(reduced, { count: 1, animations: 0 });
  });
  await check('completion and locale-aware resume persist across navigation', async () => {
    await go('/en/learn/white-corners/'); await ready();
    await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('[data-complete]')]);
    let progress = await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key);
    assert.ok(progress.completed.includes('white-corners'));
    const lastSlug = progress.lastSlug;
    await go('/');
    assert.equal(await page.$eval('[data-resume]', element => element.hidden), false);
    assert.equal(await page.$eval('[data-resume]', element => element.getAttribute('href')), `/learn/${lastSlug}/`);
    assert.equal(await page.$eval('[data-progress-slug="white-corners"] [data-completed]', element => element.hidden), false);
  });
  await check('final completion exposes success state', async () => {
    await go('/en/learn/finish/'); await ready();
    await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('[data-complete]')]);
    assert.equal(await page.$eval('[data-finished]', element => element.hidden), false);
  });
  await check('malformed localStorage recovers on next visit', async () => {
    await page.evaluate(storageKey => localStorage.setItem(storageKey, '{broken'), key);
    await go('/'); assert.equal(await page.$eval('[data-resume]', element => element.hidden), true);
    await go('/en/learn/finish/'); await ready();
    assert.equal(await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)).lastSlug, key), 'finish');
  });
  await check('blocked localStorage leaves lesson controls usable', async () => {
    const isolated = await browser.newPage();
    const errors = [];
    isolated.on('pageerror', error => errors.push(error.message));
    await isolated.evaluateOnNewDocument(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage blocked', 'SecurityError'); } }));
    try {
      await isolated.goto(new URL('/en/learn/finish/', base).href, { waitUntil: 'networkidle0' });
      await isolated.waitForFunction(() => !document.querySelector('[data-next]').disabled);
      await isolated.waitForFunction(() => !document.querySelector('[data-theme-toggle]').disabled);
      const oldMode = await isolated.$eval('[data-theme-toggle]', element => element.getAttribute('aria-pressed'));
      await isolated.click('[data-theme-toggle]');
      assert.notEqual(await isolated.$eval('[data-theme-toggle]', element => element.getAttribute('aria-pressed')), oldMode);
      await isolated.click('[data-next]');
      await isolated.waitForFunction(() => document.querySelector('[data-move-count]').textContent.startsWith('1 /'));
      assert.deepEqual(errors, []);
    } finally { await isolated.close(); }
  });
  await check('no-JavaScript lessons retain written instructions and sequence', async () => {
    const plain = await browser.newPage();
    try {
      await plain.setJavaScriptEnabled(false);
      await plain.goto(new URL('/en/learn/white-corners/', base).href, { waitUntil: 'networkidle0' });
      assert.ok(await plain.$eval('[data-case-steps]', element => element.children.length > 0));
      assert.equal(await plain.$eval('[data-case-preview]', element => element.complete && element.naturalWidth === 560), true);
      assert.ok(await plain.$eval('[data-algorithm]', element => element.children.length > 0));
      assert.ok((await plain.$eval('noscript', element => element.textContent)).includes('JavaScript'));
      assert.equal(await plain.$eval('[data-next]', element => element.disabled), true);
      await plain.$$eval('.help-disclosure', elements => elements.forEach(element => { element.open = true; }));
      assert.ok((await plain.$$('.written-case')).length > 1);
      await plain.goto(new URL('/en/privacy/', base).href, { waitUntil: 'networkidle0' });
      assert.equal(await plain.$eval('[data-clear-progress]', element => element.disabled), true);
      assert.ok((await plain.$eval('noscript', element => element.textContent)).includes('browser settings'));
    } finally { await plain.close(); }
  });
  await check('keyboard skip link and 200 percent text scaling remain usable', async () => {
    await go('/en/learn/white-corners/'); await ready();
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.classList.contains('skip-link')), true);
    await page.keyboard.press('Enter');
    assert.equal(new URL(page.url()).hash, '#main');
    await page.evaluate(async () => {
      document.documentElement.style.fontSize = '200%';
      // 확대 직후의 이전 배치 좌표로 클릭하지 않도록 두 번의 화면 갱신을 기다린다.
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    const overflow = await page.evaluate(() => {
      const clipped = [...document.querySelectorAll('button, select, a.button')].filter(element => element.getClientRects().length && element.scrollWidth > element.clientWidth + 2).map(element => element.textContent.trim());
      return { documentOverflow: document.documentElement.scrollWidth > innerWidth + 1, clipped };
    });
    assert.deepEqual(overflow, { documentOverflow: false, clipped: [] });
    // Locator는 스크롤 이후 버튼 경계가 연속 프레임에서 안정적인지 확인한다.
    await page.locator('[data-next]').click();
    await page.waitForFunction(() => Number(document.querySelector('[data-move-count]').textContent.split('/')[0]) === 1);
    assert.equal(await count(), 1);
  });
  await check('no uncaught runtime errors', () => assert.deepEqual(runtimeErrors, []));
} finally {
  await browser.close();
  await writeFile('artifacts/browser-report.json', JSON.stringify({ base, results }, null, 2));
}
console.log(`${results.filter(result => result.status === 'pass').length}/${results.length} browser checks passed.`);
if (results.some(result => result.status === 'fail')) process.exitCode = 1;
