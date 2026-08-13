import {
  PARTS_PER_UNIT,
  QUESTIONS_PER_PART,
  QUESTIONS_PER_UNIT,
  type Unit,
} from "@/data/courseStructure";

const PROGRESS_KEY = "sgo_unit_progress";

export type UnitProgress = {
  unitId: string;
  completedQuestions: number;
  currentPartIndex: number;
};

function defaultProgress(unitId: string): UnitProgress {
  return {
    unitId,
    completedQuestions: 0,
    currentPartIndex: 0,
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

export function getAllUnitProgress(unitIds: string[]): Record<string, UnitProgress> {
  const all = readAll();
  return Object.fromEntries(
    unitIds.map((id) => [id, all[id] ?? defaultProgress(id)]),
  );
}

/** Demo seed: unit 1 partially complete (7 of 40 questions). */
export function getAllUnitProgressWithDemo(unitIds: string[]): Record<string, UnitProgress> {
  const result = getAllUnitProgress(unitIds);

  for (const id of unitIds) {
    if (result[id].completedQuestions > 0) continue;
    if (id === "section-1-unit-1") {
      result[id] = {
        unitId: id,
        completedQuestions: 7,
        currentPartIndex: 0,
      };
    }
  }

  return result;
}

export function saveUnitProgress(progress: UnitProgress) {
  const all = readAll();
  all[progress.unitId] = progress;
  writeAll(all);
}

/** Increment completed questions for a unit (capped at QUESTIONS_PER_UNIT). */
export function incrementUnitProgress(unitId: string, count = 1): UnitProgress {
  const current = getUnitProgress(unitId);
  const completedQuestions = Math.min(
    QUESTIONS_PER_UNIT,
    current.completedQuestions + count,
  );
  const currentPartIndex = Math.min(
    PARTS_PER_UNIT - 1,
    Math.floor(completedQuestions / QUESTIONS_PER_PART),
  );
  const progress: UnitProgress = {
    unitId,
    completedQuestions,
    currentPartIndex,
  };
  saveUnitProgress(progress);
  return progress;
}

export function completedQuestionsInPart(
  progress: UnitProgress,
  partIndex: number,
): number {
  const partStart = partIndex * QUESTIONS_PER_PART;
  return Math.min(
    QUESTIONS_PER_PART,
    Math.max(0, progress.completedQuestions - partStart),
  );
}

export function isPartComplete(progress: UnitProgress, partIndex: number): boolean {
  return completedQuestionsInPart(progress, partIndex) >= QUESTIONS_PER_PART;
}

export function isUnitComplete(progress: UnitProgress | undefined): boolean {
  if (!progress) return false;
  return progress.completedQuestions >= QUESTIONS_PER_UNIT;
}

export function isUnitLocked(
  units: Unit[],
  unitIndex: number,
  progressByUnit: Record<string, UnitProgress>,
): boolean {
  if (unitIndex === 0) return false;
  const prevUnit = units[unitIndex - 1];
  const prevProgress =
    progressByUnit[prevUnit.id] ?? defaultProgress(prevUnit.id);
  return !isUnitComplete(prevProgress);
}

export function activeUnitIndex(
  units: Unit[],
  progressByUnit: Record<string, UnitProgress>,
): number {
  for (let i = 0; i < units.length; i++) {
    if (isUnitLocked(units, i, progressByUnit)) continue;
    const progress =
      progressByUnit[units[i].id] ?? defaultProgress(units[i].id);
    if (!isUnitComplete(progress)) return i;
  }
  return units.length - 1;
}

export function unitNodeState(
  units: Unit[],
  unitIndex: number,
  progressByUnit: Record<string, UnitProgress>,
): "locked" | "active" | "complete" {
  const unit = units[unitIndex];
  const progress = progressByUnit[unit.id] ?? defaultProgress(unit.id);

  if (isUnitLocked(units, unitIndex, progressByUnit)) return "locked";
  if (isUnitComplete(progress)) return "complete";
  if (unitIndex === activeUnitIndex(units, progressByUnit)) return "active";
  return "locked";
}

export function unitRingProgress(progress: UnitProgress): number {
  return (progress.completedQuestions / QUESTIONS_PER_UNIT) * 100;
}

export function activePartIndex(progress: UnitProgress): number {
  for (let i = 0; i < PARTS_PER_UNIT; i++) {
    if (!isPartComplete(progress, i)) return i;
  }
  return PARTS_PER_UNIT - 1;
}
