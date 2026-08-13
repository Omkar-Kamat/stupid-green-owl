import {
  LESSONS_PER_UNIT,
  QUESTIONS_PER_LESSON,
  type Unit,
} from "@/data/courseStructure";

const PROGRESS_KEY = "sgo_unit_progress";

export type UnitProgress = {
  unitId: string;
  completedQuestions: number;
  currentLessonIndex: number;
};

function defaultProgress(unitId: string): UnitProgress {
  return {
    unitId,
    completedQuestions: 0,
    currentLessonIndex: 0,
  };
}

function readAll(): Record<string, UnitProgress> {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, UnitProgress>) : {};
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, UnitProgress>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
}

export function getUnitProgress(unitId: string): UnitProgress {
  const all = readAll();
  return all[unitId] ?? defaultProgress(unitId);
}

/** Demo seed: unit 1 partially complete (7 of 40 questions). */
export function getUnitProgressWithDemo(unitId: string): UnitProgress {
  const stored = getUnitProgress(unitId);
  if (stored.completedQuestions > 0) return stored;

  if (unitId === "section-1-unit-1") {
    return {
      unitId,
      completedQuestions: 7,
      currentLessonIndex: 0,
    };
  }

  return stored;
}

export function saveUnitProgress(progress: UnitProgress) {
  const all = readAll();
  all[progress.unitId] = progress;
  writeAll(all);
}

export function completedQuestionsInLesson(
  progress: UnitProgress,
  lessonIndex: number,
): number {
  const lessonStart = lessonIndex * QUESTIONS_PER_LESSON;
  return Math.min(
    QUESTIONS_PER_LESSON,
    Math.max(0, progress.completedQuestions - lessonStart),
  );
}

export function isLessonComplete(progress: UnitProgress, lessonIndex: number): boolean {
  return completedQuestionsInLesson(progress, lessonIndex) >= QUESTIONS_PER_LESSON;
}

export function isLessonLocked(progress: UnitProgress, lessonIndex: number): boolean {
  if (lessonIndex === 0) return false;
  return !isLessonComplete(progress, lessonIndex - 1);
}

export function activeLessonIndex(progress: UnitProgress): number {
  for (let i = 0; i < LESSONS_PER_UNIT; i++) {
    if (!isLessonComplete(progress, i)) return i;
  }
  return LESSONS_PER_UNIT - 1;
}

export function lessonState(
  progress: UnitProgress,
  lessonIndex: number,
): "locked" | "active" | "complete" {
  if (isLessonLocked(progress, lessonIndex)) return "locked";
  if (isLessonComplete(progress, lessonIndex)) return "complete";
  if (lessonIndex === activeLessonIndex(progress)) return "active";
  return "locked";
}

export function unitRingProgress(progress: UnitProgress, unit: Unit): number {
  const total = unit.lessons.length * QUESTIONS_PER_LESSON;
  return (progress.completedQuestions / total) * 100;
}
