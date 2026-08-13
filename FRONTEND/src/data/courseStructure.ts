export const UNITS_PER_SECTION = 5;
export const LESSONS_PER_UNIT = 4;
export const QUESTIONS_PER_LESSON = 10;

export const QUESTION_TYPES = [
  "listening",
  "translate",
  "meaning",
  "select",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export type LessonNodeType = "start" | "star" | "chest" | "trophy";

export type LessonNode = {
  id: string;
  index: number;
  type: LessonNodeType;
  title: string;
  offset: number;
  questionTypes: QuestionType[];
};

export type Unit = {
  id: string;
  sectionNumber: number;
  unitNumber: number;
  title: string;
  guidebookSlug: string;
  lessons: LessonNode[];
};

export type CourseSection = {
  number: number;
  title: string;
  units: Unit[];
};

const LESSON_NODE_TYPES: LessonNodeType[] = ["start", "star", "chest", "trophy"];
const LESSON_OFFSETS = [0, 56, -56, 56];

/** Rotate question types across lessons (3–4 types per lesson, 10 questions each). */
function questionTypesForLesson(lessonIndex: number): QuestionType[] {
  const patterns: QuestionType[][] = [
    ["listening", "translate", "meaning", "select"],
    ["translate", "meaning", "listening"],
    ["listening", "select", "meaning", "translate"],
    ["meaning", "translate", "listening"],
  ];
  return patterns[lessonIndex % patterns.length];
}

function buildUnit(sectionNumber: number, unitNumber: number, title: string): Unit {
  const lessons: LessonNode[] = Array.from({ length: LESSONS_PER_UNIT }, (_, i) => ({
    id: `s${sectionNumber}-u${unitNumber}-l${i + 1}`,
    index: i + 1,
    type: LESSON_NODE_TYPES[i],
    title: `${title} — part ${i + 1}`,
    offset: LESSON_OFFSETS[i],
    questionTypes: questionTypesForLesson(i),
  }));

  return {
    id: `section-${sectionNumber}-unit-${unitNumber}`,
    sectionNumber,
    unitNumber,
    title,
    guidebookSlug: "guidebook",
    lessons,
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
    units: UNIT_TITLES_SECTION_1.map((title, i) =>
      buildUnit(1, i + 1, title),
    ),
  },
];

export const DEFAULT_UNIT =
  COURSE_SECTIONS[0].units[0];

export function getUnit(sectionNumber: number, unitNumber: number): Unit | undefined {
  const section = COURSE_SECTIONS.find((s) => s.number === sectionNumber);
  return section?.units.find((u) => u.unitNumber === unitNumber);
}

export function questionsInUnit(_unit: Unit): number {
  return LESSONS_PER_UNIT * QUESTIONS_PER_LESSON;
}

export function unitProgressPercent(completedQuestions: number): number {
  const total = LESSONS_PER_UNIT * QUESTIONS_PER_LESSON;
  return Math.min(100, Math.max(0, (completedQuestions / total) * 100));
}

export function lessonProgressPercent(completedInLesson: number): number {
  return Math.min(
    100,
    Math.max(0, (completedInLesson / QUESTIONS_PER_LESSON) * 100),
  );
}
