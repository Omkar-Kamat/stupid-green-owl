import { FreeFunIllustration } from "@/components/illustrations/FreeFunIllustration";

export function FreeFunEffective() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto flex max-w-[1080px] flex-col items-center gap-10 px-6 md:flex-row md:gap-16 md:px-10">
        <div className="flex-1">
          <h2 className="mb-6 text-[36px] font-extrabold lowercase leading-tight text-duo-green md:text-[48px]">
            free. fun. effective.
          </h2>
          <p className="max-w-[480px] text-lg leading-relaxed text-duo-gray">
            Learning with stupid-green-owl is fun, and{" "}
            <a
              href="#"
              className="font-bold text-duo-blue underline decoration-duo-blue underline-offset-2 hover:no-underline"
            >
              research shows that it works!
            </a>{" "}
            With quick, bite-sized lessons, you&apos;ll earn points and unlock
            new levels while gaining real-world communication skills.
          </p>
        </div>

        <div className="flex flex-1 justify-center">
          <FreeFunIllustration />
        </div>
      </div>
    </section>
  );
}
