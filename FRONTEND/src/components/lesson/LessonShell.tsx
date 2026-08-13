import type { ReactNode } from "react";
import { LessonHeader } from "@/components/lesson/LessonHeader";

export function LessonShell({
  progress,
  hearts,
  streakLabel,
  children,
  footer,
}: {
  progress: number;
  hearts: number;
  streakLabel?: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#131f24] font-duo text-white">
      <LessonHeader progress={progress} hearts={hearts} streakLabel={streakLabel} />

      <main className="mx-auto flex w-full max-w-[1140px] flex-1 flex-col px-6 pb-32 pt-10">
        {children}
      </main>

      {footer}
    </div>
  );
}
