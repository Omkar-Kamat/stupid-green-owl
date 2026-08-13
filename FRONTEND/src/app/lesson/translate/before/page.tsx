import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { TRANSLATE_EXERCISE } from "@/data/demoExercises";

export default function TranslateBeforePage() {
  return <LessonPlayer exercises={[TRANSLATE_EXERCISE]} />;
}
