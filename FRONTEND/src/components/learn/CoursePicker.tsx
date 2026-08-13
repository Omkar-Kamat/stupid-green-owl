"use client";

import { useRouter } from "next/navigation";
import { LEARN_COURSES } from "@/data/languages";
import { signInAsDemoUser } from "@/lib/demoAuth";

function CourseCard({
  id,
  name,
  flag,
  learners,
}: {
  id: string;
  name: string;
  flag: string;
  learners: string;
}) {
  const router = useRouter();

  const handleSelect = () => {
    signInAsDemoUser();
    router.push(`/learn/${id}`);
  };

  return (
    <button
      type="button"
      onClick={handleSelect}
      className="flex w-[200px] flex-col items-center rounded-2xl border-2 border-duo-gray-border bg-white px-4 pb-5 pt-6 text-center transition-colors hover:bg-[#fafafa] active:bg-[#f5f5f5]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/flags/${flag}`}
        alt=""
        width={88}
        height={68}
        className="mb-4 h-[68px] w-[88px]"
        aria-hidden
      />
      <h2 className="text-[19px] font-extrabold leading-tight text-duo-gray">
        {name}
      </h2>
      <p className="mt-1 text-[15px] text-duo-gray-light">{learners}</p>
    </button>
  );
}

export function CoursePicker() {
  return (
    <section className="flex w-full flex-col items-center px-6 py-12 md:py-16">
      <h1 className="mb-10 w-full text-center text-[32px] font-extrabold text-duo-gray md:text-[36px]">
        I want to learn...
      </h1>

      <div className="flex flex-wrap justify-center gap-4 md:gap-5">
        {LEARN_COURSES.map((course) => (
          <CourseCard
            key={course.id}
            id={course.id}
            name={course.name}
            flag={course.flag}
            learners={course.learners}
          />
        ))}
      </div>
    </section>
  );
}
