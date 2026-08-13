import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { DEMO_LESSON } from "@/data/demoExercises";

export default function LessonPage() {
  return <LessonPlayer exercises={DEMO_LESSON} />;
}
