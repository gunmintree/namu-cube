import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyAlgorithm,
  applyMove,
  getFaceGrid,
  inverseAlgorithm,
  isSolved,
  solvedCube,
  type Face,
  type Sticker,
  type Vec3,
} from '../src/lib/cube.ts';

const faces: Face[] = ['U', 'D', 'F', 'B', 'R', 'L'];
const at = (state: readonly Sticker[], position: Vec3, normal: Vec3) => {
  const sticker = state.find((item) =>
    item.position.every((value, index) => value === position[index]) &&
    item.normal.every((value, index) => value === normal[index]));
  assert.ok(sticker, `스티커 위치: ${position}, 법선: ${normal}`);
  return sticker;
};

test('완성 큐브는 고유한 스티커 54개와 색마다 9개를 가진다', () => {
  const cube = solvedCube();
  assert.equal(cube.length, 54);
  assert.equal(new Set(cube.map(({ id }) => id)).size, 54);
  assert.equal(isSolved(cube), true);
  for (const face of faces) {
    assert.equal(cube.filter(({ color }) => color === face).length, 9);
    assert.deepEqual(getFaceGrid(cube, face), Array(9).fill(face));
  }
  assert.notStrictEqual(solvedCube()[0], cube[0]);
});

// 바깥에서 해당 면을 볼 때의 시계 방향을 직접 지정한다.
const clockwiseCases: [Face, Vec3, Vec3, Vec3, Vec3, Vec3, Vec3][] = [
  ['U', [0, 1, 1], [0, 0, 1], [-1, 1, 0], [-1, 0, 0], [-1, 1, -1], [1, 1, -1]],
  ['D', [0, -1, 1], [0, 0, 1], [1, -1, 0], [1, 0, 0], [-1, -1, 1], [1, -1, 1]],
  ['F', [0, 1, 1], [0, 1, 0], [1, 0, 1], [1, 0, 0], [-1, 1, 1], [1, 1, 1]],
  ['B', [0, 1, -1], [0, 1, 0], [-1, 0, -1], [-1, 0, 0], [1, 1, -1], [-1, 1, -1]],
  ['R', [1, 1, 0], [0, 1, 0], [1, 0, -1], [0, 0, -1], [1, 1, 1], [1, 1, -1]],
  ['L', [-1, 1, 0], [0, 1, 0], [-1, 0, 1], [0, 0, 1], [-1, 1, -1], [-1, 1, 1]],
];

for (const [face, from, normal, to, nextNormal, faceCorner, nextCorner] of clockwiseCases) {
  test(`${face} 회전은 인접 면과 해당 면을 바깥 기준 시계 방향으로 옮긴다`, () => {
    const cube = solvedCube();
    const moved = applyMove(cube, face);
    const sticker = moved.find(({ id }) => id === at(cube, from, normal).id)!;
    assert.deepEqual(sticker.position, to);
    assert.deepEqual(sticker.normal, nextNormal);
    const faceNormal = at(cube, faceCorner, cube.find(({ color }) => color === face)!.normal).normal;
    const corner = moved.find(({ id }) => id === at(cube, faceCorner, faceNormal).id)!;
    assert.deepEqual(corner.position, nextCorner);
    assert.deepEqual(corner.normal, faceNormal);
    assert.equal(isSolved(moved), false);
  });

  test(`${face} 네 번, 역회전, 두 번 회전의 결과가 일치한다`, () => {
    const cube = applyAlgorithm(solvedCube(), "F R U' L2 B D");
    assert.deepEqual(applyAlgorithm(cube, `${face} ${face} ${face} ${face}`), cube);
    assert.deepEqual(applyAlgorithm(cube, `${face} ${face}'`), cube);
    assert.deepEqual(applyMove(cube, `${face}2`), applyAlgorithm(cube, `${face} ${face}`));
    assert.deepEqual(applyMove(cube, `${face}'`), applyAlgorithm(cube, `${face} ${face} ${face}`));
  });
}

test('R 회전 후 앞면과 윗면 격자는 바깥에서 보는 행 순서다', () => {
  const cube = applyMove(solvedCube(), 'R');
  assert.deepEqual(getFaceGrid(cube, 'F'), ['F', 'F', 'D', 'F', 'F', 'D', 'F', 'F', 'D']);
  assert.deepEqual(getFaceGrid(cube, 'U'), ['U', 'U', 'F', 'U', 'U', 'F', 'U', 'U', 'F']);
});

test('각 면 격자는 위에서 아래, 왼쪽에서 오른쪽 순서다', () => {
  // 각 면의 좌상단과 우하단은 격자 방향을 독립적으로 고정한다.
  const corners: [Face, Vec3, Vec3][] = [
    ['U', [-1, 1, -1], [1, 1, 1]], ['D', [-1, -1, 1], [1, -1, -1]],
    ['F', [-1, 1, 1], [1, -1, 1]], ['B', [1, 1, -1], [-1, -1, -1]],
    ['R', [1, 1, 1], [1, -1, -1]], ['L', [-1, 1, -1], [-1, -1, 1]],
  ];
  for (const [face, topLeft, bottomRight] of corners) {
    const cube = solvedCube();
    const normal = cube.find(({ color }) => color === face)!.normal;
    at(cube, topLeft, normal).color = 'B';
    at(cube, bottomRight, normal).color = 'R';
    const grid = getFaceGrid(cube, face);
    assert.equal(grid[0], 'B');
    assert.equal(grid[8], 'R');
  }
});

test('알고리즘 역순은 원상 복구하고 공백과 빈 알고리즘을 처리한다', () => {
  const algorithm = "R U2 F'\nL D B2";
  assert.equal(inverseAlgorithm(algorithm), "B2 D' L' F U2 R'");
  assert.equal(inverseAlgorithm(' \n\t '), '');
  assert.deepEqual(applyAlgorithm(applyAlgorithm(solvedCube(), algorithm), inverseAlgorithm(algorithm)), solvedCube());
  assert.deepEqual(applyAlgorithm(solvedCube(), ' \t\n'), solvedCube());
});

test('잘못된 기호는 회전과 알고리즘 및 역순에서 거부한다', () => {
  for (const invalid of ['', 'r', 'Q', 'R3', "R2'", "R''", 'RU', ' R ', 'R\n', 'R\r', 'x']) {
    assert.throws(() => applyMove(solvedCube(), invalid), /회전/);
  }
  for (const invalid of ['R Q U', 'R2\nL3', 'F RU']) {
    assert.throws(() => applyAlgorithm(solvedCube(), invalid), /회전/);
    assert.throws(() => inverseAlgorithm(invalid), /회전/);
  }
});

test('회전은 입력을 바꾸지 않고 모든 스티커와 좌표를 복제한다', () => {
  const cube = solvedCube();
  const before = structuredClone(cube);
  for (const sticker of cube) {
    Object.freeze(sticker.position);
    Object.freeze(sticker.normal);
    Object.freeze(sticker);
  }
  Object.freeze(cube);
  for (const result of [applyMove(cube, 'R'), applyAlgorithm(cube, ''), applyAlgorithm(cube, "U F R2")]) {
    assert.notStrictEqual(result, cube);
    for (let index = 0; index < cube.length; index++) {
      assert.notStrictEqual(result[index], cube[index]);
      assert.notStrictEqual(result[index].position, cube[index].position);
      assert.notStrictEqual(result[index].normal, cube[index].normal);
    }
  }
  assert.deepEqual(cube, before);
});

test('혼합 회전은 색 수와 정수 좌표 및 스티커 위치의 유일성을 보존한다', () => {
  const cube = applyAlgorithm(solvedCube(), "U R' F2 D B L2 R U' B2 F L' D2");
  for (const face of faces) assert.equal(cube.filter(({ color }) => color === face).length, 9);
  assert.equal(new Set(cube.map(({ position, normal }) => `${position}/${normal}`)).size, 54);
  for (const { position, normal } of cube) {
    assert.ok(position.every((value) => Number.isInteger(value) && Math.abs(value) <= 1));
    assert.equal(normal.reduce((sum, value) => sum + Math.abs(value), 0), 1);
  }
});

test('누락된 스티커와 색이 섞인 면은 완성 상태가 아니다', () => {
  assert.equal(isSolved([]), false);
  assert.equal(isSolved(solvedCube().slice(1)), false);
  const cube = solvedCube();
  cube[0].color = 'R';
  assert.equal(isSolved(cube), false);
});
