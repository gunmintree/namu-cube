export const PROGRESS_KEY = 'namutree:cube:progress';
export type Progress = { version: 1; lastSlug: string; completed: string[] };

function parseProgress(raw: string | null, validSlugs: readonly string[]): Progress | null {
  if (raw === null) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
    const candidate = value as Record<string, unknown>;
    if (candidate.version !== 1 || typeof candidate.lastSlug !== 'string' ||
        !validSlugs.includes(candidate.lastSlug) || !Array.isArray(candidate.completed)) return null;
    // 이전 콘텐츠나 중복 항목이 남아 있어도 현재 유효한 완료 기록은 보존한다.
    const completed = candidate.completed.filter(
      (slug): slug is string => typeof slug === 'string' && validSlugs.includes(slug),
    );
    return { version: 1, lastSlug: candidate.lastSlug, completed: [...new Set(completed)] };
  } catch {
    return null;
  }
}

export function readProgress(
  storage: Pick<Storage, 'getItem'> | null,
  validSlugs: readonly string[],
): Progress | null {
  if (!storage) return null;
  try {
    return parseProgress(storage.getItem(PROGRESS_KEY), validSlugs);
  } catch {
    return null;
  }
}

export function saveProgress(
  storage: Pick<Storage, 'getItem' | 'setItem'> | null,
  slug: string,
  validSlugs: readonly string[],
  completed = false,
): boolean {
  if (!storage || !validSlugs.includes(slug)) return false;
  try {
    const previous = parseProgress(storage.getItem(PROGRESS_KEY), validSlugs);
    const completedSlugs = previous?.completed ?? [];
    if (completed && !completedSlugs.includes(slug)) completedSlugs.push(slug);
    const progress: Progress = { version: 1, lastSlug: slug, completed: completedSlugs };
    storage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    return true;
  } catch {
    // 브라우저 설정이나 저장 공간 부족이 학습 흐름을 중단하지 않게 한다.
    return false;
  }
}

export function clearProgress(storage: Pick<Storage, 'removeItem'> | null): boolean {
  if (!storage) return false;
  try {
    storage.removeItem(PROGRESS_KEY);
    return true;
  } catch {
    return false;
  }
}
