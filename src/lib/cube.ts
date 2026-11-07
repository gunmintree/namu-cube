export type Face = 'U' | 'D' | 'F' | 'B' | 'R' | 'L';
export type Vec3 = readonly [number, number, number];
export type Sticker = { id: number; color: Face; position: Vec3; normal: Vec3 };

// x는 오른쪽, y는 위쪽, z는 앞쪽이다. 각 면의 오른쪽과 위쪽은 바깥에서 본 기준이다.
const geometry: Record<Face, { normal: Vec3; right: Vec3; up: Vec3 }> = {
  U: { normal: [0, 1, 0], right: [1, 0, 0], up: [0, 0, -1] },
  D: { normal: [0, -1, 0], right: [1, 0, 0], up: [0, 0, 1] },
  F: { normal: [0, 0, 1], right: [1, 0, 0], up: [0, 1, 0] },
  B: { normal: [0, 0, -1], right: [-1, 0, 0], up: [0, 1, 0] },
  R: { normal: [1, 0, 0], right: [0, 0, -1], up: [0, 1, 0] },
  L: { normal: [-1, 0, 0], right: [0, 0, 1], up: [0, 1, 0] },
};

function cloneSticker(sticker: Sticker): Sticker {
  return { ...sticker, position: [...sticker.position], normal: [...sticker.normal] };
}

function parseMove(move: string): { face: Face; turns: number } {
  const match = /^([UDFBRL])(['2]?)$/.exec(move);
  if (!match) throw new Error(`잘못된 회전 기호: ${move}`);
  return { face: match[1] as Face, turns: match[2] === '2' ? 2 : match[2] === "'" ? 3 : 1 };
}

function tokens(algorithm: string): string[] {
  return algorithm.trim() ? algorithm.trim().split(/\s+/) : [];
}

// 양의 축에서 바라본 반시계 방향을 +1로 두며, 삼각함수 없이 정확히 90도 회전한다.
function rotate(vector: Vec3, axis: number, direction: number): Vec3 {
  const [x, y, z] = vector;
  const rotated: Vec3 = axis === 0
    ? [x, -direction * z, direction * y]
    : axis === 1
      ? [direction * z, y, -direction * x]
      : [-direction * y, direction * x, z];
  // -0을 정규화하여 좌표 비교와 직렬화에서 같은 정수 표현을 유지한다.
  return [rotated[0] || 0, rotated[1] || 0, rotated[2] || 0];
}

export function solvedCube(): Sticker[] {
  const stickers: Sticker[] = [];
  for (const face of Object.keys(geometry) as Face[]) {
    const { normal, right, up } = geometry[face];
    for (let row = 0; row < 3; row++) {
      for (let column = 0; column < 3; column++) {
        const coordinate = (axis: number) => normal[axis] + right[axis] * (column - 1) + up[axis] * (1 - row);
        stickers.push({
          id: stickers.length,
          color: face,
          position: [coordinate(0), coordinate(1), coordinate(2)],
          normal: [...normal],
        });
      }
    }
  }
  return stickers;
}

export function applyMove(state: readonly Sticker[], move: string): Sticker[] {
  const { face, turns } = parseMove(move);
  const normal = geometry[face].normal;
  const axis = normal.findIndex((value) => value !== 0);
  const side = normal[axis];
  return state.map((sticker) => {
    const next = cloneSticker(sticker);
    if (next.position[axis] !== side) return next;
    for (let turn = 0; turn < turns; turn++) {
      // 바깥에서 본 시계 방향은 바깥쪽 법선을 중심으로 -90도이다.
      next.position = rotate(next.position, axis, -side);
      next.normal = rotate(next.normal, axis, -side);
    }
    return next;
  });
}

export function applyAlgorithm(state: readonly Sticker[], algorithm: string): Sticker[] {
  return tokens(algorithm).reduce((cube, move) => applyMove(cube, move), state.map(cloneSticker));
}

export function inverseAlgorithm(algorithm: string): string {
  return tokens(algorithm).reverse().map((move) => {
    const { face, turns } = parseMove(move);
    return turns === 2 ? `${face}2` : turns === 3 ? face : `${face}'`;
  }).join(' ');
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function getFaceGrid(state: readonly Sticker[], face: Face): Face[] {
  const { normal, right, up } = geometry[face];
  return state.filter((sticker) => dot(sticker.normal, normal) === 1)
    .sort((a, b) => 3 * (dot(b.position, up) - dot(a.position, up)) + dot(a.position, right) - dot(b.position, right))
    .map(({ color }) => color);
}

export function isSolved(state: readonly Sticker[]): boolean {
  return state.length === 54 && (Object.keys(geometry) as Face[]).every((face) => {
    const grid = getFaceGrid(state, face);
    return grid.length === 9 && grid.every((color) => color === grid[0]);
  });
}
