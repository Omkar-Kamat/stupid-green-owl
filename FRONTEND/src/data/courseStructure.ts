export const UNITS_PER_SECTION = 5;
export const PARTS_PER_UNIT = 4;
export const QUESTIONS_PER_PART = 10;

export const QUESTIONS_PER_UNIT = PARTS_PER_UNIT * QUESTIONS_PER_PART;

export const QUESTION_TYPES = [
  "listening",
  "translate",
  "meaning",
  "select",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export type UnitNodeType = "start" | "star" | "chest" | "trophy";

export type UnitPart = {
  id: string;
  partNumber: number;
  title: string;
  questionTypes: QuestionType[];
};

export type Unit = {
  id: string;
  sectionNumber: number;
  unitNumber: number;
  title: string;
  nodeType: UnitNodeType;
  offset: number;
  guidebookSlug: string;
  parts: UnitPart[];
};

export type CourseSection = {
  number: number;
  title: string;
  units: Unit[];
};

const UNIT_NODE_TYPES: UnitNodeType[] = ["start", "star", "chest", "star", "trophy"];
const UNIT_OFFSETS = [0, 56, -56, 56, 0];

function questionTypesForPart(partIndex: number): QuestionType[] {
  const patterns: QuestionType[][] = [
    ["listening", "translate", "meaning", "select"],
    ["translate", "meaning", "listening"],
    ["listening", "select", "meaning", "translate"],
    ["meaning", "translate", "listening"],
  ];
  return patterns[partIndex % patterns.length];
}

function buildUnit(sectionNumber: number, unitNumber: number, title: string): Unit {
  const parts: UnitPart[] = Array.from({ length: PARTS_PER_UNIT }, (_, i) => ({
    id: `s${sectionNumber}-u${unitNumber}-p${i + 1}`,
    partNumber: i + 1,
    title: `Part ${i + 1}`,
    questionTypes: questionTypesForPart(i),
  }));

  return {
    id: `section-${sectionNumber}-unit-${unitNumber}`,
    sectionNumber,
    unitNumber,
    title,
    nodeType: UNIT_NODE_TYPES[unitNumber - 1],
    offset: UNIT_OFFSETS[unitNumber - 1],
    guidebookSlug: "guidebook",
    parts,
  };
}

const UNIT_TITLES_SECTION_1 = [
  "Order food and drinks",
  "Describe people",
  "Talk about family",
  "Navigate the city",
  "Prepare for travel",
];

export const COURSE_SECTIONS: CourseSection[] = [
  {
    number: 1,
    title: "Basics",
    units: UNIT_TITLES_SECTION_1.map((title, i) => buildUnit(1, i + 1, title)),
  },
];

export const DEFAULT_SECTION = COURSE_SECTIONS[0];

export function getUnit(sectionNumber: number, unitNumber: number): Unit | undefined {
  const section = COURSE_SECTIONS.find((s) => s.number === sectionNumber);
  return section?.units.find((u) => u.unitNumber === unitNumber);
}

export function unitProgressPercent(completedQuestions: number): number {
  return Math.min(
    100,
    Math.max(0, (completedQuestions / QUESTIONS_PER_UNIT) * 100),
  );
}

export function partProgressPercent(completedInPart: number): number {
  return Math.min(
    100,
    Math.max(0, (completedInPart / QUESTIONS_PER_PART) * 100),
  );
}
