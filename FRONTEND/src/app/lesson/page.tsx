import Link from "next/link";

/** Legacy route — use /lesson/[lessonId] from the learning path instead. */
export default function LegacyLessonPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#131f24] px-6 font-duo text-white">
      <p className="text-center text-[#afafaf]">
        Pick a skill from the learning path to start a lesson.
      </p>
      <Link
        href="/learn/japanese"
        className="inline-flex rounded-2xl border-2 border-b-4 border-[#46a302] bg-[#58cc02] px-6 py-3 text-[13px] font-extrabold uppercase tracking-wide text-[#131f24]"
      >
        Go to path
      </Link>
    </div>
  );
}
