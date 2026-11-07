import assert from 'node:assert/strict';
import test from 'node:test';
import { allLessons } from '../src/content/lessons.ts';
import { createLearningPlan, learningStepAt, replayRange } from '../src/lib/learning.ts';

const caseFor = (slug: string, id: string) => allLessons.find(lesson => lesson.slug === slug)!.cases.find(item => item.id === id)!;

test('공식과 정렬을 합치면 모든 사례의 원래 동작이 한 동작도 빠짐없이 복원된다', () => {
  for (const lesson of allLessons) for (const item of lesson.cases) {
    const plan = createLearningPlan(lesson.slug, item);
    assert.deepEqual(plan.blocks.flatMap(block => block.moves), item.moves.split(' '), `${lesson.slug}.${item.id}`);
    assert.deepEqual(plan.chunks.flatMap(chunk => chunk.moves), plan.formula);
    assert.equal(plan.repetitions, plan.blocks.filter(block => block.kind === 'formula').length);
    for (let cursor = 0; cursor < item.steps.length; cursor++) {
      const step = learningStepAt(plan, cursor)!;
      assert.equal(step.block.moves[step.offset], item.moves.split(' ')[cursor]);
      if (step.block.kind === 'formula') assert.equal(plan.formula[step.offset], item.moves.split(' ')[cursor]);
    }
    assert.equal(learningStepAt(plan, item.steps.length), null);
  }
});

test('공식 반복과 중간·마지막 정렬은 서로 구분된다', () => {
  const dot = createLearningPlan('yellow-cross', caseFor('yellow-cross', 'dot'));
  assert.deepEqual(dot.formula, ['F', 'R', 'U', "R'", "U'", "F'"]);
  assert.equal(dot.repetitions, 3);
  assert.deepEqual(dot.blocks.filter(block => block.kind === 'alignment').map(block => block.moves), [['U2']]);
  assert.equal(learningStepAt(dot, 6)!.block.kind, 'alignment');
  assert.equal(learningStepAt(dot, 7)!.offset, 0);
  const finish = createLearningPlan('finish', caseFor('finish', 'complete-walkthrough'));
  assert.equal(finish.formula.length, 4);
  assert.equal(finish.repetitions, 6);
  assert.deepEqual(finish.blocks.filter(block => block.kind === 'alignment').map(block => block.moves), [['U'], ["U'"]]);
});

test('다시 보기는 진행 중이거나 방금 끝낸 확인 묶음으로만 돌아간다', () => {
  const item = caseFor('yellow-cross', 'dot');
  assert.deepEqual(replayRange(item, 0), { start: 0, end: 6 });
  assert.deepEqual(replayRange(item, 6), { start: 0, end: 6 });
  assert.deepEqual(replayRange(item, 7), { start: 6, end: 7 });
  assert.deepEqual(replayRange(item, 10), { start: 7, end: 13 });
  assert.deepEqual(replayRange(item, 19), { start: 13, end: 19 });
});
