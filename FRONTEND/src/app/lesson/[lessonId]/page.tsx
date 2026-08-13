"use client";

import { useParams } from "next/navigation";
import { ApiLessonPlayer } from "@/components/lesson/ApiLessonPlayer";

export default function LessonPage() {
  const params = useParams<{ lessonId: string }>();
  const lessonId = Number(params.lessonId);

  if (!Number.isFinite(lessonId) || lessonId <= 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#131f24] font-duo text-white">
        <p className="text-lg font-bold text-[#afafaf]">Invalid lesson id.</p>
      </div>
    );
  }

  return <ApiLessonPlayer lessonId={lessonId} />;
}
