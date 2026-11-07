import type { Lesson, LessonCase, Locale } from '../content/lessons';
import { createLearningPlan, learningStepAt } from '../lib/learning';
import { describeMove } from '../lib/presentation';

export function createFormulaGuide(host: HTMLElement, lesson: Lesson, locale: Locale) {
  const ko = locale === 'ko';
  const q = <T extends HTMLElement = HTMLElement>(selector: string) => host.querySelector<T>(selector)!;
  const conceal = q<HTMLInputElement>('[data-formula-hide]');
  const copy = q<HTMLButtonElement>('[data-formula-copy]');
  const panel = q('[data-formula-guide]');
  const dock = q('[data-formula-dock]');
  let plan = createLearningPlan(lesson.slug, lesson.cases[0]);
  let cursor = 0;
  let busy = false;
  const display = (move: string) => move.replace("'", '′');

  function update(nextCursor: number, nextBusy: boolean) {
    cursor = nextCursor; busy = nextBusy;
    const step = learningStepAt(plan, cursor);
    const hidden = conceal.checked;
    const alignment = step?.block.kind === 'alignment';
    const move = step?.block.moves[step.offset];
    q('[data-active-move]').textContent = !move ? (ko ? '끝' : 'Done') : hidden ? '?' : display(move);
    q('[data-active-move]').dataset.finished = String(!move);
    q('[data-move-copy]').textContent = !move ? (ko ? (lesson.slug === 'finish' ? '예시의 여섯 면이 맞았어요. 실물도 확인해요.' : '예시가 끝났어요. 실물의 완료 조건을 확인해요.') : (lesson.slug === 'finish' ? 'All six example faces are solved. Check your real cube too.' : 'Example complete. Check your real cube.')) : hidden ? (ko ? '다음 동작을 떠올린 뒤 확인해요.' : 'Recall the next move, then check it.') : describeMove(move, locale);
    const position = step ? `${busy ? (ko ? '현재' : 'Now') : (ko ? '다음' : 'Next')} ${step.offset + 1}/${plan.formula.length}` : '';
    q('[data-routine-position]').textContent = !step ? (ko ? '확인하고 다음으로' : 'Check before continuing') : alignment ? (ko ? '공식 사이의 별도 정렬' : 'Separate alignment between formulas') : plan.recurring ? (ko ? `공식 ${step.block.occurrence}/${plan.repetitions}회 · ${position}` : `Formula ${step.block.occurrence}/${plan.repetitions} · ${position}`) : position;
    const note = q('[data-alignment]');
    note.hidden = !alignment;
    note.textContent = hidden ? (ko ? '지금은 기본 공식 사이의 정렬이에요. 기호를 떠올려 보세요.' : 'This is a separate alignment. Recall its symbol.') : (ko ? `지금은 기본 공식 대신 ${step?.block.moves.map(display).join(' ')}로 정렬해요. 이 동작도 빠뜨리지 않아요.` : `Align with ${step?.block.moves.map(display).join(' ')} here, outside the base formula. Include this move.`);
    host.querySelectorAll<HTMLElement>('[data-formula-token]').forEach(token => {
      const index = Number(token.dataset.index);
      const active = Boolean(step && !alignment && index === step.offset);
      token.classList.toggle('move-current', active);
      token.classList.toggle('move-done', Boolean(step && !alignment && index < step.offset));
      if (active) token.setAttribute('aria-current', 'step'); else token.removeAttribute('aria-current');
      token.setAttribute('aria-label', hidden ? (ko ? `가린 ${index + 1}번째 기호` : `Hidden symbol ${index + 1}`) : describeMove(plan.formula[index], locale));
      token.querySelector<HTMLElement>('[data-symbol]')!.hidden = hidden;
      token.querySelector<HTMLElement>('[data-mask]')!.hidden = !hidden;
    });
    const dockMoves = alignment ? step!.block.moves : plan.formula;
    q('[data-dock-label]').textContent = hidden ? (ko ? '공식 가림' : 'Formula hidden') : alignment ? (ko ? '별도 정렬' : 'Alignment') : plan.recurring ? (ko ? '기본 공식' : 'Formula') : (ko ? '예시 순서' : 'Example moves');
    q('[data-dock-formula]').replaceChildren(...dockMoves.map((move, i) => {
      const token = document.createElement('span'); token.textContent = hidden ? '?' : display(move);
      if (step && i === step.offset) token.setAttribute('aria-current', 'step');
      return token;
    }));
    panel.dataset.concealed = String(hidden);
    copy.disabled = hidden;
    q('[data-full-sequence]').hidden = hidden;
  }

  function load(item: LessonCase) {
    plan = createLearningPlan(lesson.slug, item);
    q('[data-formula-title]').textContent = ko ? (plan.recurring ? '외울 기본 공식' : '이번 예시의 순서') : (plan.recurring ? 'The formula to learn' : 'This example’s moves');
    const alignments = plan.blocks.filter(block => block.kind === 'alignment').reduce((sum, block) => sum + block.moves.length, 0);
    q('[data-formula-summary]').textContent = plan.recurring ? (ko ? `이 예시: ${plan.formula.length}동작 공식 ${plan.repetitions}회${alignments ? ` + 별도 정렬 ${alignments}동작` : ''}` : `This example: ${plan.repetitions} × ${plan.formula.length}-move formula${alignments ? ` + ${alignments} alignment move(s)` : ''}`) : (ko ? `이 예시의 ${plan.formula.length}동작을 순서대로 해요.` : `Follow these ${plan.formula.length} moves in order.`);
    q('[data-algorithm]').replaceChildren(...plan.chunks.map(chunk => {
      const group = document.createElement('div'); group.className = 'formula-chunk';
      const tokens = document.createElement('div'); tokens.className = 'formula-tokens';
      chunk.moves.forEach((move, i) => {
        const token = document.createElement('span'); token.className = 'formula-token'; token.dataset.formulaToken = ''; token.dataset.index = String(chunk.start + i); token.setAttribute('role', 'listitem');
        const symbol = document.createElement('b'); symbol.dataset.symbol = ''; symbol.textContent = display(move);
        const mask = document.createElement('b'); mask.dataset.mask = ''; mask.textContent = '?'; mask.hidden = true;
        token.append(symbol, mask); tokens.append(token);
      });
      group.append(tokens); return group;
    }));
    q('[data-full-sequence]').replaceChildren(...plan.blocks.map(block => {
      const li = document.createElement('li');
      const label = document.createElement('strong'); label.textContent = block.kind === 'formula' ? (ko ? `기본 공식 ${block.occurrence}회째` : `Formula repetition ${block.occurrence}`) : (ko ? '별도 정렬' : 'Separate alignment');
      const moves = document.createElement('code'); moves.textContent = block.moves.map(display).join(' ');
      li.append(label, moves); return li;
    }));
    q('[data-formula-copy-status]').textContent = '';
    q('[data-copy-fallback]').hidden = true;
    conceal.disabled = false;
    update(0, false);
  }
  conceal.addEventListener('change', () => {
    q('[data-copy-fallback]').hidden = true;
    q('[data-formula-copy-status]').textContent = '';
    update(cursor, busy);
  });
  copy.addEventListener('click', async () => {
    const value = plan.formula.join(' ');
    try {
      if (!navigator.clipboard) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(value);
      q('[data-formula-copy-status]').textContent = ko ? '공식을 복사했어요.' : 'Formula copied.';
    } catch {
      q('[data-copy-fallback]').hidden = false;
      const field = q<HTMLInputElement>('[data-copy-text]'); field.value = value; field.focus(); field.select();
      q('[data-formula-copy-status]').textContent = ko ? '아래에서 직접 복사할 수 있어요.' : 'Copy it manually below.';
    }
  });

  // 공식이 화면 위로 사라진 동안만 참고 띠를 보인다. 수업 영역 밖에서는 숨긴다.
  const observer = new IntersectionObserver(() => {
    const formula = panel.getBoundingClientRect();
    const workspace = q('.lesson-workspace').getBoundingClientRect();
    dock.hidden = !(formula.bottom <= 0 && workspace.bottom > 0 && workspace.top < innerHeight);
  });
  observer.observe(panel); observer.observe(q('.lesson-workspace'));
  q('[data-return-to-cube]').addEventListener('click', () => q('#cube-practice').focus({ preventScroll: true }));
  return { load, update };
}
