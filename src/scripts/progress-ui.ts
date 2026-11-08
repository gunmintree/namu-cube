import { readProgress, clearProgress } from '../lib/progress';
// 경로 목록만 전달받아 다른 수업의 전체 본문을 내려받지 않는다.
const slugs = (document.body.dataset.lessonSlugs ?? '').split(',').filter(Boolean);
// 사생활 보호 모드나 저장소 차단에서도 학습 본문을 계속 사용할 수 있다.
let storage: Storage | null = null;
try { storage = window.localStorage; } catch { /* 저장 기능 없이 계속한다. */ }
const progress = readProgress(storage, slugs);

// 보조 설명을 포함한 저장 기록에서 본 수업의 직접 확인만 집계한다.
document.querySelectorAll<HTMLElement>('[data-course-progress]').forEach(section => {
  const mainSlugs = (section.dataset.courseProgress ?? '').split(',').filter(Boolean);
  const checked = mainSlugs.filter(slug => progress?.completed.includes(slug)).length;
  const meter = section.querySelector<HTMLProgressElement>('progress');
  const count = section.querySelector<HTMLElement>('[data-progress-count]');
  if (meter) { meter.max = mainSlugs.length; meter.value = checked; }
  if (count) count.textContent = `${checked} / ${mainSlugs.length}`;
  section.hidden = false;
});
document.querySelectorAll<HTMLAnchorElement>('[data-resume]').forEach(link => {
  if (!progress) return;
  const base = link.dataset.locale === 'en' ? '/en' : '';
  link.href = `${base}/learn/${progress.lastSlug}/`;
  link.hidden = false;
});
document.querySelectorAll<HTMLElement>('[data-progress-slug]').forEach(item => {
  if (progress?.completed.includes(item.dataset.progressSlug!)) {
    const mark = item.querySelector<HTMLElement>('[data-completed]');
    if (mark) mark.hidden = false;
  }
});
const clearButton = document.querySelector<HTMLButtonElement>('[data-clear-progress]');
if (clearButton) clearButton.disabled = storage === null;
clearButton?.addEventListener('click', event => {
  const button = event.currentTarget as HTMLButtonElement;
  const message = document.querySelector<HTMLElement>('[data-clear-result]')!;
  const ko = document.documentElement.lang === 'ko';
  if (!window.confirm(ko ? '이 기기에 저장한 학습 기록을 지울까요?' : 'Clear learning progress on this device?')) return;
  const cleared = clearProgress(storage);
  message.textContent = cleared ? (ko ? '이 기기의 학습 기록을 지웠어요.' : 'Learning progress was cleared on this device.') : (ko ? '저장소에 접근할 수 없어요.' : 'Storage is unavailable.');
  button.disabled = cleared;
});
