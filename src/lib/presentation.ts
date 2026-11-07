import type { Sticker, Face } from './cube.ts';

// 좌표 모델의 위쪽 양수 축을 브라우저의 아래쪽 양수 축으로 바꾼다.
export function stickerTransform(sticker: Sticker): string {
  const [x, y, z] = sticker.position;
  const [nx, ny, nz] = sticker.normal;
  const angle = nx ? `rotateY(${nx * 90}deg)` : ny ? `rotateX(${ny * 90}deg)` : nz < 0 ? 'rotateY(180deg)' : '';
  return `translate3d(${x * 58 + nx * 29}px,${-y * 58 - ny * 29}px,${z * 58 + nz * 29}px) ${angle}`;
}

export const colorNames: Record<'ko' | 'en', Record<Face, string>> = {
  ko: { U: '노랑', D: '하양', F: '초록', B: '파랑', R: '빨강', L: '주황' },
  en: { U: 'Yellow', D: 'White', F: 'Green', B: 'Blue', R: 'Red', L: 'Orange' },
};

export function describeMove(move: string, locale: 'ko' | 'en'): string {
  const faces: Record<string, [string, string]> = {
    U: ['윗면', 'top face'], D: ['아랫면', 'bottom face'], F: ['앞면', 'front face'],
    B: ['뒷면', 'back face'], R: ['오른쪽 면', 'right face'], L: ['왼쪽 면', 'left face'],
  };
  const name = faces[move[0]]?.[locale === 'ko' ? 0 : 1] ?? move;
  if (locale === 'ko') return `${name}을 ${move.endsWith('2') ? '반 바퀴' : move.endsWith("'") ? '반시계 방향으로 한 칸' : '시계 방향으로 한 칸'} 돌려요.`;
  return `Turn the ${name} ${move.endsWith('2') ? 'half a turn' : move.endsWith("'") ? 'a quarter turn counterclockwise' : 'a quarter turn clockwise'}.`;
}
