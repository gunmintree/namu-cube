import assert from 'node:assert/strict';
import test from 'node:test';
import { lessons, allLessons, text } from '../src/content/lessons.ts';
import type { Copy } from '../src/content/lessons.ts';
import { guidance } from '../src/content/guidance.ts';

function bilingual(copy: Copy, label: string) {
  for (const locale of ['ko', 'en'] as const) {
    assert.ok(typeof copy?.[locale] === 'string' && copy[locale].trim().length > 0, `${label}.${locale}`);
  }
}

test('every learning route has unique, populated bilingual content', () => {
  assert.equal(lessons.length, 7);
  assert.equal(new Set(lessons.map((lesson) => lesson.slug)).size, lessons.length);
  for (const lesson of lessons) {
    assert.match(lesson.slug, /^[a-z]+(?:-[a-z]+)*$/);
    for (const key of ['title', 'shortTitle', 'goal', 'intro', 'hold', 'check', 'help'] as const) {
      bilingual(lesson[key], `${lesson.slug}.${key}`);
    }
    assert.ok(lesson.tips.length > 0);
    lesson.tips.forEach((tip) => bilingual(tip, `${lesson.slug}.tip`));
    assert.ok(lesson.cases.length > 0);
    assert.equal(new Set(lesson.cases.map((item) => item.id)).size, lesson.cases.length);
    for (const item of lesson.cases) {
      for (const key of ['title', 'when', 'hold', 'after'] as const) bilingual(item[key], `${lesson.slug}.${item.id}.${key}`);
      assert.ok(item.steps.length > 0);
      item.steps.forEach((step) => bilingual(step, `${lesson.slug}.${item.id}.step`));
    }
  }
});

test('모든 수업에 양언어 시작 조건과 실물 반복·종료 안내가 있다', () => {
  for (const lesson of allLessons) {
    const guide = guidance[lesson.slug];
    assert.ok(guide, lesson.slug);
    bilingual(guide.before, `${lesson.slug}.before`);
    assert.ok(guide.steps.length >= 3, lesson.slug);
    guide.steps.forEach((step, i) => bilingual(step, `${lesson.slug}.method.${i}`));
  }
});

test('every demonstrated move has one matching instruction and uses supported notation', () => {
  for (const lesson of lessons) for (const item of lesson.cases) {
    assert.ok(item.moves.trim().length > 0, `${lesson.slug}.${item.id}`);
    const moves = item.moves.trim().split(/\s+/);
    for (const move of moves) assert.match(move, /^[URFDLB](?:'|2)?$/);
    assert.equal(item.steps.length, moves.length, `${lesson.slug}.${item.id}: one instruction per move`);
    for (const move of item.targetSetup?.trim().split(/\s+/).filter(Boolean) ?? []) assert.match(move, /^[URFDLB](?:'|2)?$/);
  }
});

test('locale selection returns the requested language without falling back to another', () => {
  assert.equal(text({ ko: '한국어', en: 'English' }, 'ko'), '한국어');
  assert.equal(text({ ko: '한국어', en: 'English' }, 'en'), 'English');
});

test('main learning begins with the white cross and keeps preparation as optional help', () => {
  assert.deepEqual(lessons.map(lesson => lesson.slug), ['white-cross', 'white-corners', 'middle-layer', 'yellow-cross', 'yellow-edges', 'yellow-corners', 'finish']);
  assert.equal(allLessons.length, 9);
  assert.ok(allLessons.some(lesson => lesson.slug === 'ready'));
  assert.ok(allLessons.some(lesson => lesson.slug === 'daisy'));
  for (const lesson of allLessons) {
    assert.doesNotMatch(JSON.stringify(lesson), /보호자|grown-up|caregiver/);
  }
});

test('early lesson targets show their actual stage rather than a fully solved cube', () => {
  for (const slug of ['white-cross', 'white-corners', 'middle-layer']) {
    const lesson = lessons.find(item => item.slug === slug)!;
    const first = lesson.cases[0]!;
    const target = applyAlgorithm(solvedCube(), first.targetSetup ?? '');
    assert.equal(isSolved(target), false, slug);
    if (slug === 'white-cross') assert.equal(firstLayer(target), false);
    if (slug === 'white-corners') assert.equal(firstTwo(target), false);
  }
});
import { applyAlgorithm, getFaceGrid, inverseAlgorithm, isSolved, solvedCube } from '../src/lib/cube.ts';
import type { Face, Sticker, Vec3 } from '../src/lib/cube.ts';
import type { LessonCase } from '../src/content/lessons.ts';

const sides: Face[] = ['F', 'R', 'B', 'L'];
const topEdges: Vec3[] = [[0, 1, 1], [1, 1, 0], [0, 1, -1], [-1, 1, 0]];
const topCorners: Vec3[] = [[1, 1, 1], [1, 1, -1], [-1, 1, -1], [-1, 1, 1]];
const normals: Record<Face, Vec3> = { U: [0, 1, 0], D: [0, -1, 0], F: [0, 0, 1], R: [1, 0, 0], B: [0, 0, -1], L: [-1, 0, 0] };
const same = (a: Vec3, b: Vec3) => a.every((value, i) => value === b[i]);
const at = (state: readonly Sticker[], position: Vec3) => state.filter((sticker) => same(sticker.position, position));
const colors = (state: readonly Sticker[], position: Vec3) => at(state, position).map((sticker) => sticker.color).sort().join('');
const colorOn = (state: readonly Sticker[], position: Vec3, face: Face) => at(state, position).find((sticker) => same(sticker.normal, normals[face]))?.color;
const correctCorners = (state: readonly Sticker[]) => topCorners.filter((position) => colors(state, position) === colors(solvedCube(), position));
const matchingSides = (state: readonly Sticker[]) => sides.filter((face) => getFaceGrid(state, face)[1] === face);
const petals = (state: readonly Sticker[]) => topEdges.filter((position) => colorOn(state, position, 'U') === 'D').length;
const topYellow = (state: readonly Sticker[]) => topEdges.filter((position) => colorOn(state, position, 'U') === 'U').length;
const firstLayer = (state: readonly Sticker[]) => getFaceGrid(state, 'D').every((color) => color === 'D') && sides.every((face) => getFaceGrid(state, face).slice(6).every((color) => color === face));
const firstTwo = (state: readonly Sticker[]) => firstLayer(state) && sides.every((face) => getFaceGrid(state, face).slice(3).every((color) => color === face));
const whiteCross = (state: readonly Sticker[]) => [1, 3, 5, 7].every((i) => getFaceGrid(state, 'D')[i] === 'D') && sides.every((face) => getFaceGrid(state, face)[7] === face);
const casesFor = (slug: string) => allLessons.find((lesson) => lesson.slug === slug)!.cases;
const before = (item: LessonCase) => applyAlgorithm(applyAlgorithm(solvedCube(), item.targetSetup ?? ''), inverseAlgorithm(item.moves));
const after = (item: LessonCase) => applyAlgorithm(before(item), item.moves);

test('daisy examples start with the stated white edge and place or prepare a petal', () => {
  const items = allLessons.find(lesson => lesson.slug === 'daisy')!.cases;
  assert.equal(colorOn(before(items[0]!), [0, -1, 1], 'D'), 'D');
  assert.notEqual(colorOn(before(items[0]!), [0, 1, 1], 'U'), 'D');
  assert.equal(colorOn(before(items[1]!), [1, 0, 1], 'F'), 'D');
  assert.notEqual(colorOn(before(items[1]!), [1, 1, 0], 'U'), 'D');
  assert.equal(colorOn(before(items[2]!), [1, 0, 1], 'R'), 'D');
  assert.notEqual(colorOn(before(items[2]!), [0, 1, 1], 'U'), 'D');
  for (const item of items.slice(0, 3)) {
    assert.equal(petals(before(item)), 3, item.id);
    assert.equal(petals(after(item)), 4, item.id);
  }
  const lower = items[3]!;
  assert.equal(colorOn(before(lower), [0, -1, 1], 'F'), 'D');
  assert.notEqual(colorOn(before(lower), [0, 1, 1], 'U'), 'D');
  assert.equal(colorOn(after(lower), [-1, 0, 1], 'F'), 'D');
  assert.equal(petals(after(lower)), 3);
});

test('white-cross examples align the side color before inserting a petal', () => {
  const items = casesFor('white-cross');
  assert.equal(colorOn(before(items[0]!), [0, 1, 1], 'U'), 'D');
  assert.equal(colorOn(before(items[0]!), [0, 1, 1], 'F'), 'F');
  assert.equal(colorOn(before(items[1]!), [1, 1, 0], 'U'), 'D');
  assert.equal(colorOn(before(items[1]!), [1, 1, 0], 'R'), 'F');
  for (const item of items) assert.ok(whiteCross(after(item)), item.id);
});

test('white-corner cases preserve the cross and insert all three top orientations', () => {
  const items = casesFor('white-corners');
  const directions: Face[] = ['R', 'U', 'F'];
  for (let i = 0; i < 3; i++) {
    const item = items[i]!;
    assert.ok(whiteCross(before(item)), item.id);
    assert.equal(colors(before(item), [1, 1, 1]), 'DFR');
    assert.equal(colorOn(before(item), [1, 1, 1], directions[i]!), 'D');
    assert.ok(firstLayer(after(item)), item.id);
  }
  const eject = items[3]!;
  assert.ok(whiteCross(before(eject)));
  assert.equal(colorOn(before(eject), [1, -1, 1], 'F'), 'D');
  assert.equal(colors(after(eject), [1, 1, 1]), 'DFR');
  assert.ok(whiteCross(after(eject)));
});

test('middle-layer cases insert left and right while preserving the first layer', () => {
  const items = casesFor('middle-layer');
  for (let i = 0; i < 2; i++) {
    const item = items[i]!;
    assert.ok(firstLayer(before(item)), item.id);
    assert.equal(colorOn(before(item), [0, 1, 1], 'F'), 'F');
    assert.equal(colorOn(before(item), [0, 1, 1], 'U'), i === 0 ? 'R' : 'L');
    assert.ok(firstTwo(after(item)), item.id);
  }
  const eject = items[2]!;
  assert.ok(firstLayer(before(eject)));
  assert.ok(topEdges.every((position) => colors(before(eject), position).includes('U')), 'all top edges contain yellow before ejection');
  assert.equal(colorOn(before(eject), [1, 0, 1], 'F'), 'R', 'front-right edge starts flipped');
  assert.ok(topEdges.some((position) => colors(after(eject), position) === 'FR'), 'the trapped edge is ejected to the top');
  assert.ok(firstLayer(after(eject)));
});

test('yellow-cross cases match dot, back-left L and horizontal line with lower layers intact', () => {
  const items = casesFor('yellow-cross');
  const expected = [2, 2, 0];
  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    assert.ok(firstTwo(before(item)), item.id);
    assert.equal(topYellow(before(item)), expected[i], item.id);
    assert.equal(topYellow(after(item)), 4, item.id);
    assert.ok(firstTwo(after(item)), item.id);
  }
  for (const position of [[-1, 1, 0], [1, 1, 0]] as Vec3[]) assert.equal(colorOn(before(items[0]!), position, 'U'), 'U');
  for (const position of [[0, 1, -1], [-1, 1, 0]] as Vec3[]) assert.equal(colorOn(before(items[1]!), position, 'U'), 'U');
  const firstGroup = "F R U R' U' F'";
  const elbowIntermediate = applyAlgorithm(before(items[1]!), firstGroup);
  for (const position of [[-1, 1, 0], [1, 1, 0]] as Vec3[]) assert.equal(colorOn(elbowIntermediate, position, 'U'), 'U');
  const dotIntermediate = applyAlgorithm(before(items[2]!), firstGroup + ' U2');
  for (const position of [[0, 1, -1], [-1, 1, 0]] as Vec3[]) assert.equal(colorOn(dotIntermediate, position, 'U'), 'U');
});

test('yellow-edge cases match adjacent or opposite conditions and preserve the lower layers', () => {
  const items = casesFor('yellow-edges');
  assert.deepEqual(matchingSides(before(items[0]!)), ['R', 'B']);
  assert.deepEqual(matchingSides(before(items[1]!)), ['F', 'B']);
  for (const item of items) {
    assert.ok(firstTwo(before(item)), item.id);
    assert.equal(topYellow(before(item)), 4, item.id);
    assert.deepEqual(matchingSides(after(item)), ['F', 'R', 'B', 'L']);
    assert.equal(topYellow(after(item)), 4, item.id);
    assert.ok(firstTwo(after(item)), item.id);
  }
});

test('yellow-corner cases cycle only corner homes while preserving matched edges and lower layers', () => {
  const items = casesFor('yellow-corners');
  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    assert.equal(correctCorners(before(item)).length, i === 2 ? 0 : 1, item.id);
    if (i < 2) assert.deepEqual(correctCorners(before(item)), [[1, 1, 1]]);
    assert.equal(correctCorners(after(item)).length, i === 2 ? 1 : 4, item.id);
    for (const state of [before(item), after(item)]) {
      assert.ok(firstTwo(state), item.id);
      assert.equal(topYellow(state), 4, item.id);
      assert.deepEqual(matchingSides(state), ['F', 'R', 'B', 'L']);
    }
  }
});

test('7단계의 모든 시작 사례는 첫 꼭짓점 뒤 다음 조각과 최종 정렬까지 이어진다', () => {
  const items = casesFor('finish');
  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    const state = before(item);
    assert.ok(firstTwo(state), item.id);
    assert.equal(correctCorners(state).length, 4, item.id);
    assert.equal(topYellow(state), 4, item.id);
    assert.deepEqual(matchingSides(state), ['F', 'R', 'B', 'L']);
    assert.deepEqual(topCorners.filter((position) => colorOn(state, position, 'U') !== 'U'), [[1, 1, 1], [1, 1, -1]]);
    const firstCornerLength = item.id === 'two-corners-front' ? 16 : 8;
    assert.equal(colorOn(state, [1, 1, 1], item.id === 'two-corners-front' ? 'F' : 'R'), 'U');
    const firstCornerMoves = item.moves.split(' ').slice(0, firstCornerLength).join(' ');
    const intermediate = applyAlgorithm(state, firstCornerMoves);
    assert.equal(colorOn(intermediate, [1, 1, 1], 'U'), 'U');
    assert.ok(!firstTwo(intermediate), 'lower layers temporarily change while a corner is oriented');
    assert.ok(item.moves.length > firstCornerMoves.length, '첫 꼭짓점 뒤의 동작도 같은 사례에 포함한다');
    assert.equal(item.moves.split(' ')[firstCornerLength], 'U', '다음 꼭짓점은 윗면만 돌려 가져온다');
    assert.ok(isSolved(after(item)), '선택한 모든 사례가 여섯 면 완성까지 이어진다');
  }
});

test('7단계는 완성까지 이어지는 시연을 기본으로 연다', () => {
  const first = casesFor('finish')[0];
  assert.equal(first.id, 'complete-walkthrough');
  assert.ok(isSolved(after(first)));
});

test('a white edge facing sideways in the top layer can be brought up without losing petals', () => {
  const item = casesFor('daisy').find((entry) => entry.id === 'top-side');
  assert.ok(item, 'the top-side case must be selectable');
  const start = before(item);
  assert.equal(petals(start), 3, '꽃잎 세 개를 모은 뒤 마지막 조각이 옆을 보는 상황');
  assert.equal(colorOn(start, [0, 1, 1], 'F'), 'D');
  assert.equal(colorOn(start, [1, 1, 0], 'U'), 'D', '올릴 자리에 기존 꽃잎이 있다');
  const lowered = applyAlgorithm(start, 'F');
  assert.equal(petals(lowered), 3, '먼저 선택한 조각만 가운데 층으로 꺼낸다');
  assert.equal(colorOn(lowered, [1, 0, 1], 'F'), 'D');
  const aligned = applyAlgorithm(lowered, "U'");
  assert.equal(petals(aligned), 3);
  assert.notEqual(colorOn(aligned, [1, 1, 0], 'U'), 'D', '꺼낸 다음 윗면을 돌려 목적지를 비운다');
  assert.deepEqual(item.checkpoints.map(point => point.at), [1, 2, 3]);
  assert.equal(petals(after(item)), 4);
});

test('3층 사례는 다음 단계의 미완성 조각을 남긴다', () => {
  for (const slug of ['yellow-cross', 'yellow-edges', 'yellow-corners']) {
    for (const item of casesFor(slug)) {
      assert.equal(isSolved(after(item)), false, `${slug}.${item.id}`);
      if (slug === 'yellow-cross') assert.ok(matchingSides(after(item)).length < 4, item.id);
      if (slug === 'yellow-edges') assert.ok(correctCorners(after(item)).length < 4, item.id);
    }
  }
});

test('노란 십자 반복은 정렬과 각 여섯 동작 뒤에 확인 지점을 둔다', () => {
  for (const [id, stops, yellowCounts] of [
    ['line', [6], [4]], ['elbow', [6, 12], [2, 4]], ['dot', [6, 7, 13, 19], [2, 2, 2, 4]],
  ] as const) {
    const item = casesFor('yellow-cross').find(item => item.id === id)!;
    assert.deepEqual(item.checkpoints?.map(point => point.at), stops, id);
    stops.forEach((stop, i) => {
      const state = applyAlgorithm(before(item), item.moves.split(' ').slice(0, stop).join(' '));
      assert.equal(topYellow(state), yellowCounts[i], `${id}.${stop}`);
      assert.ok(firstTwo(state), `${id}.${stop}`);
    });
  }
});

test('확인 지점은 순서대로 있고 마지막 동작까지 안내한다', () => {
  for (const lesson of allLessons) for (const item of lesson.cases) {
    const points = item.checkpoints;
    assert.ok(points?.length, `${lesson.slug}.${item.id}`);
    let previous = 0;
    for (const point of points) {
      assert.ok(point.at > previous && point.at <= item.steps.length, item.id);
      bilingual(point.title, `${item.id}.title`);
      bilingual(point.check, `${item.id}.check`);
      previous = point.at;
    }
    assert.equal(previous, item.steps.length, item.id);
  }
});

test('최종 연속 시연은 다음 꼭짓점 이동과 마지막 정렬을 생략하지 않는다', () => {
  const item = casesFor('finish').find(item => item.id === 'complete-walkthrough');
  assert.ok(item, '연속 완성 사례');
  assert.ok(firstTwo(before(item)));
  assert.equal(correctCorners(before(item)).length, 4);
  assert.ok(!isSolved(before(item)));
  assert.ok(isSolved(after(item)));
  assert.deepEqual(item.checkpoints.map(point => point.at), [8, 9, 17, 25, 26]);
  const firstCorner = applyAlgorithm(before(item), item.moves.split(' ').slice(0, 8).join(' '));
  assert.equal(colorOn(firstCorner, [1, 1, 1], 'U'), 'U');
  assert.ok(!firstTwo(firstCorner), '첫 꼭짓점 뒤에는 아래층을 따로 고치면 안 된다');
  const beforeAlignment = applyAlgorithm(before(item), item.moves.split(' ').slice(0, 25).join(' '));
  assert.ok(getFaceGrid(beforeAlignment, 'U').every(color => color === 'U'));
  assert.ok(firstTwo(beforeAlignment));
  assert.ok(!isSolved(beforeAlignment), '윗면이 노랑이어도 마지막 정렬이 남아 있다');
});
