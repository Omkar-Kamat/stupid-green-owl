import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { LISTENING_EXERCISE } from "@/data/demoExercises";

export default function ListeningBeforePage() {
  return <LessonPlayer exercises={[LISTENING_EXERCISE]} />;
}
