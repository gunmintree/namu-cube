import assert from 'node:assert/strict';
import test from 'node:test';
import { applyAlgorithm, applyMove, solvedCube } from '../src/lib/cube.ts';
import type { Sticker, Vec3 } from '../src/lib/cube.ts';

const group = "R' D' R D";
const corners: Vec3[] = [[1, 1, 1], [1, 1, -1], [-1, 1, -1], [-1, 1, 1]];
const same = (a: Vec3, b: Vec3) => a.every((value, index) => value === b[index]);
const colorsAt = (state: Sticker[], position: Vec3) => state
  .filter(sticker => same(sticker.position, position)).map(sticker => sticker.color).sort().join('');
const yellowUp = (state: Sticker[], position: Vec3) => state
  .some(sticker => same(sticker.position, position) && same(sticker.normal, [0, 1, 0]) && sticker.color === 'U');
const exceptTopCorners = (state: Sticker[]) => state
  .filter(({ position: [x, y, z] }) => y !== 1 || x === 0 || z === 0);

test('마지막 꼭짓점의 합법적인 방향 27가지를 두 묶음씩 확인하며 완성한다', () => {
  const solved = solvedCube();
  const uniqueStates = new Set<string>();
  const twistedCounts = [0, 0, 0, 0, 0];

  // 꼭짓점 비틀림의 합은 3의 배수여야 한다. 0·2·4묶음의 합이 6의 배수인
  // 조합만 열거하면 아래층을 복원하면서 윗꼭짓점 방향 3^3 = 27가지를 만든다.
  for (const a of [0, 2, 4]) for (const b of [0, 2, 4]) {
    for (const c of [0, 2, 4]) for (const d of [0, 2, 4]) {
      if ((a + b + c + d) % 6 !== 0) continue;
      const label = `준비 묶음: ${[a, b, c, d].join(', ')}`;
      let state = solvedCube();
      for (const count of [a, b, c, d]) {
        state = applyAlgorithm(state, [...Array(count).fill(group), 'U'].join(' '));
      }

      // 역공식과의 상쇄만 보지 않고, 수업의 실제 시작 조건과 조합의 고유성을 검사한다.
      assert.deepEqual(exceptTopCorners(state), exceptTopCorners(solved), label);
      for (const position of corners) {
        assert.equal(colorsAt(state, position), colorsAt(solved, position), label);
      }
      uniqueStates.add(JSON.stringify(state));
      twistedCounts[corners.filter(position => !yellowUp(state, position)).length]++;

      // 이미 맞은 꼭짓점은 건너뛴다. 두 묶음 뒤 확인하고 필요하면 두 묶음 더 하며,
      // 큐브 전체를 돌리지 않고 U만 사용해 다음 꼭짓점을 작업 위치로 가져온다.
      for (let corner = 0; corner < 4; corner++) {
        let groups = 0;
        while (!yellowUp(state, corners[0]) && groups < 4) {
          state = applyAlgorithm(state, `${group} ${group}`);
          groups += 2;
        }
        assert.ok(yellowUp(state, corners[0]), `${label}, 작업 꼭짓점 ${corner}`);
        state = applyMove(state, 'U');
      }
      assert.deepEqual(state, solved, label);
    }
  }

  assert.equal(uniqueStates.size, 27);
  assert.deepEqual(twistedCounts, [1, 0, 12, 8, 6]);
});
