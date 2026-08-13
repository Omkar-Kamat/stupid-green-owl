export type WordTile = {
  id: string;
  romaji?: string;
  japanese?: string;
  word?: string;
};

export type ListeningExercise = {
  id: string;
  type: "listening";
  title: string;
  bank: WordTile[];
  correctOrder: string[];
  incorrectFeedback: {
    romaji: string;
    japanese: string;
    meaning: string;
  };
};

export type TranslateExercise = {
  id: string;
  type: "translate";
  title: string;
  segments: { furigana: string; text: string }[];
  bank: WordTile[];
  correctOrder: string[];
};

export type MeaningExercise = {
  id: string;
  type: "meaning";
  title: string;
  prompt: string;
  character: "elder" | "lucy";
  options: { id: string; romaji: string; japanese: string }[];
  correctOptionId: string;
};

export type DemoExercise = ListeningExercise | TranslateExercise | MeaningExercise;

export const LISTENING_EXERCISE: ListeningExercise = {
  id: "listening-1",
  type: "listening",
  title: "Tap what you hear",
  bank: [
    { id: "sushi", romaji: "sushi", japanese: "すし" },
    { id: "mizu", romaji: "mizu", japanese: "みず" },
    { id: "gohan", romaji: "go ha n", japanese: "ごはん" },
    { id: "to", romaji: "to", japanese: "と" },
    { id: "ocha", romaji: "o cha", japanese: "おちゃ" },
    { id: "kudasai", romaji: "ku da sa i", japanese: "ください" },
  ],
  correctOrder: ["sushi", "to", "ocha", "kudasai"],
  incorrectFeedback: {
    romaji: "su shi to o cha ku da sa i",
    japanese: "すしとおちゃ、ください。",
    meaning: "Sushi and green tea, please.",
  },
};

export const TRANSLATE_EXERCISE: TranslateExercise = {
  id: "translate-1",
  type: "translate",
  title: "Write this in English",
  segments: [
    { furigana: "mi zu", text: "みず" },
    { furigana: "to", text: "と" },
    { furigana: "o cha", text: "おちゃ" },
    { furigana: "", text: "、" },
    { furigana: "ku da sa i", text: "ください" },
    { furigana: "", text: "。" },
  ],
  bank: [
    { id: "water", word: "Water" },
    { id: "and", word: "and" },
    { id: "green", word: "green" },
    { id: "tea", word: "tea" },
    { id: "please", word: "please" },
    { id: "rice", word: "rice" },
  ],
  correctOrder: ["water", "and", "green", "tea", "please"],
};

export const MEANING_EXERCISE: MeaningExercise = {
  id: "meaning-1",
  type: "meaning",
  title: "Select the correct meaning",
  prompt: "and",
  character: "elder",
  options: [
    { id: "gohan", romaji: "go ha n", japanese: "ごはん" },
    { id: "to", romaji: "to", japanese: "と" },
    { id: "kudasai", romaji: "ku da sa i", japanese: "ください" },
  ],
  correctOptionId: "to",
};

export const MEANING_EXERCISE_2: MeaningExercise = {
  id: "meaning-2",
  type: "meaning",
  title: "Select the correct meaning",
  prompt: "water",
  character: "lucy",
  options: [
    { id: "ocha", romaji: "o cha", japanese: "おちゃ" },
    { id: "mizu", romaji: "mi zu", japanese: "みず" },
    { id: "kudasai", romaji: "ku da sa i", japanese: "ください" },
  ],
  correctOptionId: "mizu",
};

export const DEMO_LESSON: DemoExercise[] = [
  LISTENING_EXERCISE,
  TRANSLATE_EXERCISE,
  MEANING_EXERCISE,
  MEANING_EXERCISE_2,
];
