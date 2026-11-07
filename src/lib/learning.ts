import type { Copy, LessonCase } from '../content/lessons';

type Chunk = { title: Copy; moves: string[]; start: number };
type Block = { kind: 'formula' | 'alignment'; moves: string[]; start: number; end: number; occurrence: number };
export type LearningPlan = { formula: string[]; chunks: Chunk[]; blocks: Block[]; repetitions: number; recurring: boolean };
const c = (ko: string, en: string): Copy => ({ ko, en });

// 공식은 실제 사례의 첫 동작에서 읽는다. 같은 공식의 반복과 그 사이의 정렬을 분리한다.
export function createLearningPlan(slug: string, item: LessonCase): LearningPlan {
  const moves = item.moves.trim().split(/\s+/);
  const rhythms: Record<string, { sizes: number[]; titles: Copy[] }> = {
    'white-corners': { sizes: [2, 2], titles: [c('시계 두 동작', 'Two clockwise moves'), c('반시계 두 동작', 'Two reverse moves')] },
    'middle-layer': { sizes: [4, 4], titles: [c('옆면으로 네 동작', 'Four moves with the side'), c('앞면으로 네 동작', 'Four moves with the front')] },
    'yellow-cross': { sizes: [1, 4, 1], titles: [c('앞면 열기', 'Open the front'), c('첫 층의 네 동작', 'The first-layer four moves'), c('앞면 닫기', 'Close the front')] },
    'yellow-edges': { sizes: [4, 4], titles: [c('윗면 한 칸', 'Top quarter turn'), c('윗면 반 바퀴', 'Top half turn')] },
    'yellow-corners': { sizes: [4, 4], titles: [c('앞의 네 동작', 'First four moves'), c('뒤의 네 동작', 'Last four moves')] },
    finish: { sizes: [2, 2], titles: [c('반시계 두 동작', 'Two reverse moves'), c('시계 두 동작', 'Two clockwise moves')] },
  };
  const rhythm = rhythms[slug];
  const sizes = rhythm?.sizes ?? moves.map(() => 1);
  const formula = moves.slice(0, sizes.reduce((sum, size) => sum + size, 0));
  let start = 0;
  const chunks = sizes.map((size, i) => {
    const chunk = { start, moves: formula.slice(start, start + size), title: rhythm?.titles[i] ?? c(`${i + 1}번째 동작`, `Move ${i + 1}`) };
    start += size;
    return chunk;
  });
  const matches = (index: number) => formula.every((move, offset) => moves[index + offset] === move);
  const blocks: Block[] = [];
  let repetitions = 0;
  for (let cursor = 0; cursor < moves.length;) {
    const start = cursor;
    const kind = matches(cursor) ? 'formula' : 'alignment';
    if (kind === 'formula') { cursor += formula.length; repetitions++; }
    else { do { cursor++; } while (cursor < moves.length && !matches(cursor)); }
    blocks.push({ kind, start, end: cursor, moves: moves.slice(start, cursor), occurrence: repetitions });
  }
  return { formula, chunks, blocks, repetitions, recurring: Boolean(rhythm) };
}

export function learningStepAt(plan: LearningPlan, cursor: number) {
  const block = plan.blocks.find(block => cursor >= block.start && cursor < block.end);
  return block ? { block, offset: cursor - block.start } : null;
}

export function replayRange(item: LessonCase, cursor: number) {
  const index = item.checkpoints.findIndex(point => cursor <= point.at);
  const phase = index < 0 ? item.checkpoints.length - 1 : index;
  return { start: phase === 0 ? 0 : item.checkpoints[phase - 1].at, end: item.checkpoints[phase].at };
}
