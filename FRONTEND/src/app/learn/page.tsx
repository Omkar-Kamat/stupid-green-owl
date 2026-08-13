import { CoursePicker } from "@/components/learn/CoursePicker";
import { LearnHeader } from "@/components/learn/LearnHeader";

export default function LearnPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <LearnHeader />
      <main className="mx-auto flex w-full max-w-[920px] flex-1 flex-col items-center">
        <CoursePicker />
      </main>
    </div>
  );
}
