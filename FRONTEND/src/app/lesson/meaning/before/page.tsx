import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { MEANING_EXERCISE } from "@/data/demoExercises";

export default function MeaningBeforePage() {
  return <LessonPlayer exercises={[MEANING_EXERCISE]} />;
}
