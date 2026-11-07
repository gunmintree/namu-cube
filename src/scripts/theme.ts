const root = document.documentElement;
const toggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
const preference = matchMedia('(prefers-color-scheme: dark)');
const key = 'namutree:cube:theme';
const ko = root.lang === 'ko';

function syncTheme() {
  const dark = root.dataset.mode ? root.dataset.mode === 'dark' : preference.matches;
  if (toggle) {
    toggle.disabled = false;
    toggle.setAttribute('aria-pressed', String(dark));
    const label = ko ? (dark ? '밝은 모드로 전환' : '어두운 모드로 전환') : (dark ? 'Switch to light mode' : 'Switch to dark mode');
    toggle.setAttribute('aria-label', label); toggle.title = label;
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', getComputedStyle(root).getPropertyValue('--color-paper').trim());
}
toggle?.addEventListener('click', () => {
  const dark = root.dataset.mode ? root.dataset.mode === 'dark' : preference.matches;
  root.dataset.mode = dark ? 'light' : 'dark';
  try { localStorage.setItem(key, root.dataset.mode); } catch { /* 저장이 막혀도 현재 화면의 테마는 바꾼다. */ }
  syncTheme();
});
preference.addEventListener('change', syncTheme);
window.addEventListener('storage', event => {
  if (event.key !== key) return;
  if (event.newValue === 'light' || event.newValue === 'dark') root.dataset.mode = event.newValue;
  else delete root.dataset.mode;
  syncTheme();
});
syncTheme();
