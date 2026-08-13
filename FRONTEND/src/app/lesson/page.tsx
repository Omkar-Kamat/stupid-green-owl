import Link from "next/link";

const LESSONS = [
  {
    type: "Listening — Tap what you hear",
    before: "/lesson/listening/before",
    after: "/lesson/listening/after",
  },
  {
    type: "Translate — Write this in English",
    before: "/lesson/translate/before",
    after: "/lesson/translate/after",
  },
  {
    type: "Meaning — Select the correct meaning",
    before: "/lesson/meaning/before",
    after: "/lesson/meaning/after",
  },
];

export default function LessonIndexPage() {
  return (
    <div className="min-h-screen bg-[#131f24] px-6 py-12 font-duo text-white">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/learn/japanese"
          className="text-[13px] font-bold text-[#1cb0f6] hover:underline"
        >
          ← Back to learning path
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold">Lesson question demos</h1>
        <p className="mt-2 text-[#afafaf]">
          Before and after answering states for each Duolingo question type.
        </p>

        <ul className="mt-10 space-y-6">
          {LESSONS.map((lesson) => (
            <li
              key={lesson.type}
              className="rounded-2xl border-2 border-[#37464f] bg-[#202f36] p-5"
            >
              <h2 className="text-lg font-extrabold">{lesson.type}</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href={lesson.before}
                  className="rounded-xl border-2 border-b-4 border-[#52656d] bg-[#37464f] px-4 py-2 text-[13px] font-bold uppercase hover:bg-[#3f5560]"
                >
                  Before answering
                </Link>
                <Link
                  href={lesson.after}
                  className="rounded-xl border-2 border-b-4 border-[#46a302] bg-[#58cc02] px-4 py-2 text-[13px] font-bold uppercase text-[#131f24] hover:brightness-110"
                >
                  After answering
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
