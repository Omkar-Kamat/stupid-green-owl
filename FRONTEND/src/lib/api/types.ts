export type SkillStatus = "locked" | "available" | "completed";

export type ExerciseType =
  | "multiple_choice"
  | "translate"
  | "match_pairs"
  | "fill_blank"
  | "type_answer";

export type UserResponse = {
  id: number;
  username: string;
  avatar_url: string | null;
  created_at: string;
};

export type UserStatsResponse = {
  total_xp: number;
  current_streak: number;
  hearts: number;
  max_hearts: number;
  gems: number;
  daily_goal: number;
};

export type SkillPathResponse = {
  id: number;
  title: string;
  icon: string;
  status: SkillStatus;
  crown_level: number;
};

export type UnitResponse = {
  id: number;
  title: string;
  color_theme: string;
  skills: SkillPathResponse[];
};

export type PathResponse = {
  units: UnitResponse[];
};

export type ExerciseResponse = {
  id: number;
  type: ExerciseType;
  prompt: string;
  data: Record<string, unknown>;
};

export type StartLessonResponse = {
  attempt_id: number;
  current_exercise_index: number;
  hearts_remaining: number;
  exercises: ExerciseResponse[];
};

export type AnswerRequest = {
  exercise_id: number;
  answer: string | string[] | Record<string, string>;
};

export type AnswerResponse = {
  correct: boolean;
  correct_answer: unknown;
  hearts_remaining: number;
  next_exercise_index: number;
  lesson_failed: boolean;
};

export type CompleteResponse = {
  xp_awarded: number;
  total_xp: number;
  streak: number;
  crown_earned: boolean;
};

export type LeaderboardEntry = {
  rank: number;
  user_id: number;
  username: string;
  avatar_url: string | null;
  total_xp: number;
  current_streak: number;
};

export type LeaderboardResponse = {
  entries: LeaderboardEntry[];
  current_user_rank: number | null;
};

export type ApiErrorBody = {
  detail: string | Array<{ msg: string; loc: (string | number)[] }>;
};
