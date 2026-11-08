import type { Lesson, Locale } from '../content/lessons';
import { solvedCube, applyAlgorithm, applyMove, inverseAlgorithm, getFaceGrid, isSolved } from '../lib/cube';
import type { Face } from '../lib/cube';
import { colorNames } from '../lib/presentation';
import { replayRange } from '../lib/learning';
import { saveProgress } from '../lib/progress';
import { createCubeView } from './cube-view';
import { createFormulaGuide } from './formula-guide';

const host = document.querySelector<HTMLElement>('[data-lesson]');
const json = document.querySelector('#lesson-data');
if (host && json?.textContent) {
  const { lesson, locale, slugs } = JSON.parse(json.textContent) as { lesson: Lesson; locale: Locale; slugs: string[] };
  const ko = locale === 'ko';
  const q = <T extends HTMLElement = HTMLElement>(selector: string) => host.querySelector<T>(selector)!;
  const view = createCubeView(host, locale);
  const formula = createFormulaGuide(host, lesson, locale);
  const next = q<HTMLButtonElement>('[data-next]');
  const previous = q<HTMLButtonElement>('[data-previous]');
  const play = q<HTMLButtonElement>('[data-play]');
  const reset = q<HTMLButtonElement>('[data-reset]');
  const replay = q<HTMLButtonElement>('[data-replay-group]');
  const speed = q<HTMLSelectElement>('[data-speed]');
  const select = q<HTMLSelectElement>('[data-case]');
  const angleButtons = Array.from(host.querySelectorAll<HTMLButtonElement>('[data-view]'));
  const bottom = q<HTMLButtonElement>('[data-bottom]');
  const viewReset = q<HTMLButtonElement>('[data-view-reset]');
  const orbit = q('[data-orbit]');
  let bottomReturn: ReturnType<typeof view.getAngle> | null = null;
  let current = lesson.cases[0];
  let moves: string[] = [];
  let frames = [solvedCube()];
  let cursor = 0;
  let busy = false;
  let playing = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let storage: Storage | null = null;
  try { storage = localStorage; } catch { /* 저장이 막혀도 수업은 이용할 수 있다. */ }
  saveProgress(storage, lesson.slug, slugs);

  function stop() { playing = false; clearTimeout(timer); }
  function update() {
    previous.disabled = busy || cursor === 0;
    next.disabled = busy || cursor >= moves.length;
    reset.disabled = busy || cursor === 0;
    replay.disabled = busy;
    select.disabled = busy;
    speed.disabled = busy;
    play.disabled = !playing && (busy || cursor >= moves.length);
    angleButtons.forEach(button => { button.disabled = false; });
    bottom.disabled = false;
    viewReset.disabled = false;
    const continuing = lesson.slug === 'finish' && current.checkpoints.some(point => point.at === cursor) && cursor < moves.length;
    play.textContent = playing ? (ko ? '잠깐 멈추기' : 'Pause') : continuing ? (cursor === moves.length - 1 ? (ko ? '마지막 정렬' : 'Align top') : moves[cursor].startsWith('U') ? (ko ? '다음 꼭짓점' : 'Next corner') : (ko ? '이어서 돌리기' : 'Continue')) : (ko ? '묶음 재생' : 'Play group');
    play.classList.toggle('primary', continuing); play.classList.toggle('secondary', !continuing);
    next.classList.toggle('primary', !continuing); next.classList.toggle('secondary', continuing);
    q('[data-move-count]').textContent = `${cursor} / ${moves.length}`;
    formula.update(cursor, busy);
    const phaseIndex = current.checkpoints.findIndex(point => cursor <= point.at);
    const phase = current.checkpoints[phaseIndex];
    q('.checkpoint-status').hidden = cursor === 0;
    q('[data-checkpoint-title]').textContent = `${phaseIndex + 1} / ${current.checkpoints.length}: ${phase.title[locale]}`;
    q('[data-checkpoint-copy]').textContent = cursor === phase.at ? phase.check[locale] : cursor === 0 ? current.when[locale] : (ko ? '이번 묶음의 동작을 끝까지 한 뒤 확인해요. 앞면을 바꾸지 않아요.' : 'Finish this group before checking. Keep the same front.');
    const solved = isSolved(frames[cursor]);
    q('[data-demo-complete]').hidden = cursor < moves.length || !solved;
    q('[data-case-after]').hidden = cursor < moves.length;
    q('.cube-body').setAttribute('aria-label', solved ? (ko ? '예시 큐브의 여섯 면이 모두 맞은 모습' : 'Example cube with all six faces solved') : (ko ? '학습용 3×3 큐브 예시' : 'Example 3×3 learning cube'));
    Array.from(q('[data-case-phases]').children).forEach((item, i) => {
      if (i === phaseIndex) item.setAttribute('aria-current', 'step'); else item.removeAttribute('aria-current');
      item.classList.toggle('phase-done', i < phaseIndex);
    });
    const top = host!.querySelector<HTMLElement>('[data-current-top]');
    if (top) {
      top.replaceChildren(...getFaceGrid(frames[cursor], 'U').map((color, i) => {
        const tile = document.createElement('span');
        const ignored = lesson.slug === 'yellow-cross' && [0, 2, 6, 8].includes(i);
        tile.className = ignored ? 'goal-unimportant' : `color-${color}`;
        tile.title = ignored ? (ko ? '꼭짓점은 나중에' : 'Corner: ignore for now') : colorNames[locale][color];
        tile.textContent = ignored ? '' : colorNames[locale][color].slice(0, 1);
        return tile;
      }));
      Array.from(q('[data-edge-comparison]').children).forEach((item, i) => {
        const side = (['F', 'R', 'B', 'L'] as Face[])[i];
        const color = getFaceGrid(frames[cursor], side)[1];
        item.children[1].className = `color-${color}`;
        item.children[1].textContent = colorNames[locale][color].slice(0, 1);
        item.children[1].setAttribute('title', colorNames[locale][color]);
        item.children[2].setAttribute('title', colorNames[locale][side]);
        item.children[3].textContent = ko ? (color === side ? '맞음' : '다름') : (color === side ? 'Match' : 'Different');
      });
    }
  }
  function loadCase() {
    stop();
    current = lesson.cases.find(c => c.id === select.value) ?? lesson.cases[0];
    moves = current.moves.trim().split(/\s+/).filter(Boolean);
    frames = [applyAlgorithm(applyAlgorithm(solvedCube(), current.targetSetup ?? ''), inverseAlgorithm(current.moves))];
    for (const move of moves) frames.push(applyMove(frames[frames.length - 1], move));
    cursor = 0;
    view.render(frames[0]);
    const preview = q<HTMLImageElement>('[data-case-preview]');
    preview.src = `/images/cases/${lesson.slug}-${current.id}.png`;
    preview.alt = `${ko ? '시작 예시의 위·앞·오른쪽 면' : 'Top, front and right of the starting example'}: ${current.title[locale]}`;
    q('[data-case-when]').textContent = current.when[locale];
    q('[data-case-hold]').textContent = current.hold[locale];
    q('[data-case-after]').textContent = current.after[locale];
    const goal = q('[data-goal-face]');
    goal.replaceChildren(...getFaceGrid(frames.at(-1)!, goal.dataset.goalFace as Face).map(color => {
      const tile = document.createElement('span');
      tile.className = `color-${color}`;
      tile.title = colorNames[locale][color];
      tile.textContent = colorNames[locale][color].slice(0, 1);
      return tile;
    }));
    q('[data-case-steps]').replaceChildren(...current.steps.map(step => {
      const li = document.createElement('li'); li.textContent = step[locale]; return li;
    }));
    formula.load(current);
    let start = 1;
    q('[data-case-phases]').replaceChildren(...current.checkpoints.map(point => {
      const li = document.createElement('li');
      const title = document.createElement('strong'); title.textContent = point.title[locale];
      const range = document.createElement('span'); range.textContent = ko ? `${start}–${point.at} 동작` : `Moves ${start}–${point.at}`;
      li.append(title, range); start = point.at + 1;
      return li;
    }));
    update();
  }
  async function advance() {
    if (busy || cursor >= moves.length) { stop(); update(); return; }
    busy = true; update();
    await view.animate(frames[cursor], frames[cursor + 1], moves[cursor], Number(speed.value));
    cursor++; busy = false;
    if (current.checkpoints.some(point => point.at === cursor)) stop();
    update();
    if (playing) timer = setTimeout(advance, 700);
  }
  next.addEventListener('click', () => { stop(); void advance(); });
  previous.addEventListener('click', () => {
    if (busy || !cursor) return;
    stop(); cursor--; view.render(frames[cursor]); update();
  });
  play.addEventListener('click', () => {
    if (playing) { stop(); update(); return; }
    playing = true; void advance();
  });
  reset.addEventListener('click', () => { if (!busy) loadCase(); });
  replay.addEventListener('click', () => {
    if (busy) return;
    stop(); cursor = replayRange(current, cursor).start;
    view.render(frames[cursor]); playing = true; void advance();
  });
  select.addEventListener('change', loadCase);
  function syncCamera() {
    const angle = view.getAngle();
    angleButtons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.view) === angle.degrees && Number(button.dataset.tilt ?? -24) === angle.tilt)));
    bottom.setAttribute('aria-pressed', String(bottomReturn !== null));
    bottom.textContent = bottomReturn ? (ko ? '보던 모습으로' : 'Restore previous view') : (ko ? '아랫면 보기' : 'See the bottom');
  }
  function resetCamera() { bottomReturn = null; view.setAngle(-32); syncCamera(); }
  angleButtons.forEach(button => button.addEventListener('click', () => {
    bottomReturn = null;
    view.setAngle(Number(button.dataset.view), Number(button.dataset.tilt ?? -24)); syncCamera();
  }));
  bottom.addEventListener('click', () => {
    if (bottomReturn) {
      view.setAngle(bottomReturn.degrees, bottomReturn.tilt); bottomReturn = null;
    } else {
      bottomReturn = view.getAngle(); view.setAngle(bottomReturn.degrees, 28);
    }
    syncCamera();
  });
  viewReset.addEventListener('click', resetCamera);
  orbit.tabIndex = 0;
  orbit.setAttribute('role', 'group');
  orbit.setAttribute('aria-label', ko ? '큐브 관찰 방향 조작' : 'Cube view controls');
  orbit.setAttribute('aria-describedby', 'view-help');
  orbit.setAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight ArrowUp ArrowDown Home');
  let drag: { id: number; x: number; y: number; degrees: number; tilt: number } | null = null;
  orbit.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    stop(); update();
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, ...view.getAngle() };
    orbit.setPointerCapture(event.pointerId); orbit.classList.add('is-dragging');
  });
  orbit.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    view.setAngle(drag.degrees + (event.clientX - drag.x) * .5, drag.tilt - (event.clientY - drag.y) * .5);
    syncCamera();
  });
  const endDrag = () => { drag = null; orbit.classList.remove('is-dragging'); };
  orbit.addEventListener('pointerup', endDrag);
  orbit.addEventListener('pointercancel', endDrag);
  orbit.addEventListener('lostpointercapture', endDrag);
  orbit.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') { resetCamera(); return; }
    const angle = view.getAngle();
    view.setAngle(angle.degrees + (event.key === 'ArrowRight' ? 15 : event.key === 'ArrowLeft' ? -15 : 0), angle.tilt + (event.key === 'ArrowDown' ? 15 : event.key === 'ArrowUp' ? -15 : 0));
    syncCamera();
  });
  q('[data-complete]').addEventListener('click', () => { saveProgress(storage, lesson.slug, slugs, true); });
  host.querySelectorAll<HTMLDetailsElement>('[data-recovery]').forEach(help => {
    help.addEventListener('toggle', () => { if (help.open) { stop(); update(); } });
  });
  host.querySelectorAll<HTMLAnchorElement>('a[href="#recovery"]').forEach(link => {
    link.addEventListener('click', () => { stop(); update(); });
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stop(); update(); } });
  window.addEventListener('pagehide', stop);
  resetCamera(); loadCase();
}
