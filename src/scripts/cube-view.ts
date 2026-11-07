import type { Sticker } from '../lib/cube';
import { stickerTransform, colorNames } from '../lib/presentation';

export function createCubeView(host: HTMLElement, locale: 'ko' | 'en') {
  const body = host.querySelector<HTMLElement>('.cube-body')!;
  let angle = { degrees: -32, tilt: -24 };
  function render(state: readonly Sticker[]) {
    body.replaceChildren(...state.map(sticker => {
      const tile = document.createElement('span');
      tile.className = `cube-sticker color-${sticker.color}`;
      tile.dataset.sticker = String(sticker.id);
      tile.style.transform = stickerTransform(sticker);
      tile.setAttribute('aria-hidden', 'true');
      if (sticker.position.filter(n => n === 0).length === 2) {
        const label = document.createElement('span');
        label.className = 'center-letter';
        label.textContent = colorNames[locale][sticker.color].slice(0, 1);
        tile.append(label);
      }
      return tile;
    }));
  }
  async function animate(before: readonly Sticker[], after: readonly Sticker[], move: string, duration: number) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || duration === 0) { render(after); return; }
    const faces: Record<string, [number, number, string]> = { R: [0, 1, 'X'], L: [0, -1, 'X'], U: [1, 1, 'Y'], D: [1, -1, 'Y'], F: [2, 1, 'Z'], B: [2, -1, 'Z'] };
    const [axis, side, label] = faces[move[0]];
    // CSS의 아래쪽 양수 좌표계에서는 X/Z축 회전 부호가 반대다.
    const angle = -90 * side * (move.endsWith("'") ? -1 : 1) * (move.endsWith('2') ? 2 : 1) * (axis === 1 ? 1 : -1);
    const layer = document.createElement('div');
    layer.className = 'cube-layer';
    for (const sticker of before.filter(s => s.position[axis] === side)) {
      const tile = body.querySelector(`[data-sticker="${sticker.id}"]`);
      if (tile) layer.append(tile);
    }
    body.append(layer);
    try {
      await layer.animate([{ transform: `rotate${label}(0deg)` }, { transform: `rotate${label}(${angle}deg)` }], { duration, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }).finished;
    } finally { render(after); }
  }
  return {
    render, animate,
    getAngle() { return { ...angle }; },
    setAngle(degrees: number, tilt = -24) {
      angle = { degrees, tilt: Math.max(-90, Math.min(90, tilt)) };
      body.style.transform = `rotateX(${angle.tilt}deg) rotateY(${angle.degrees}deg)`;
    },
  };
}
