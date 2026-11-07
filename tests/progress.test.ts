import assert from 'node:assert/strict';
import test from 'node:test';
import { PROGRESS_KEY, readProgress, saveProgress, clearProgress } from '../src/lib/progress.ts';

const slugs = ['intro', 'practice', 'finish'];

// 실제 저장소처럼 키별 문자열을 보관한다.
class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

test('방문과 완료 기록을 병합하고 중복 없이 유지한다', () => {
  const storage = new MemoryStorage();
  assert.equal(saveProgress(storage, 'intro', slugs, true), true);
  assert.equal(saveProgress(storage, 'intro', slugs, true), true);
  assert.equal(saveProgress(storage, 'practice', slugs), true);
  assert.deepEqual(readProgress(storage, slugs), {
    version: 1, lastSlug: 'practice', completed: ['intro'],
  });
  assert.deepEqual(JSON.parse(storage.getItem(PROGRESS_KEY)!), {
    version: 1, lastSlug: 'practice', completed: ['intro'],
  });
});

test('알려진 완료 항목만 중복 없이 읽는다', () => {
  const storage = new MemoryStorage();
  storage.setItem(PROGRESS_KEY, JSON.stringify({
    version: 1, lastSlug: 'intro', completed: ['practice', 'unknown', 'practice', 12],
  }));
  assert.deepEqual(readProgress(storage, slugs), {
    version: 1, lastSlug: 'intro', completed: ['practice'],
  });
  saveProgress(storage, 'finish', slugs, true);
  assert.deepEqual(readProgress(storage, slugs), {
    version: 1, lastSlug: 'finish', completed: ['practice', 'finish'],
  });
});

test('잘못된 JSON 구조나 알 수 없는 마지막 방문을 거부한다', () => {
  const storage = new MemoryStorage();
  for (const value of ['{', 'null', '[]', '1', '"text"',
    '{"version":2,"lastSlug":"intro","completed":[]}',
    '{"version":1,"lastSlug":"unknown","completed":[]}',
    '{"version":1,"lastSlug":1,"completed":[]}',
    '{"version":1,"lastSlug":"intro","completed":{}}',
    '{"version":1,"lastSlug":"intro"}']) {
    storage.setItem(PROGRESS_KEY, value);
    assert.equal(readProgress(storage, slugs), null, value);
  }
  assert.equal(saveProgress(storage, 'unknown', slugs, true), false);
  assert.equal(saveProgress(storage, 'intro', slugs), true);
  assert.deepEqual(readProgress(storage, slugs), {
    version: 1, lastSlug: 'intro', completed: [],
  });
});

test('저장소 없음과 접근 예외를 안전하게 처리한다', () => {
  assert.equal(readProgress(null, slugs), null);
  assert.equal(saveProgress(null, 'intro', slugs), false);
  assert.equal(clearProgress(null), false);
  const unavailable = {
    getItem(): never { throw new Error('blocked'); },
    setItem(): never { throw new Error('blocked'); },
    removeItem(): never { throw new Error('blocked'); },
  };
  assert.equal(readProgress(unavailable, slugs), null);
  assert.equal(saveProgress(unavailable, 'intro', slugs), false);
  assert.equal(clearProgress(unavailable), false);
  const full = new MemoryStorage();
  full.setItem = () => { throw new Error('quota'); };
  assert.equal(saveProgress(full, 'intro', slugs), false);
});

test('진행 기록만 삭제한다', () => {
  const storage = new MemoryStorage();
  storage.setItem('other', 'keep');
  saveProgress(storage, 'intro', slugs, true);
  assert.equal(clearProgress(storage), true);
  assert.equal(readProgress(storage, slugs), null);
  assert.equal(storage.getItem('other'), 'keep');
});
