import { MainHeroIllustration } from "@/components/illustrations/MainHeroIllustration";
import { Button } from "@/components/ui/Button";

export function MainHero() {
  return (
    <section className="flex flex-1 flex-col bg-white">
      <div className="mx-auto flex flex-1 max-w-[1080px] flex-col items-center justify-center gap-8 px-6 py-12 md:flex-row md:items-center md:gap-12 md:px-10 md:py-16">
        <div className="flex flex-1 justify-center">
          <MainHeroIllustration />
        </div>

        <div className="flex flex-1 flex-col items-center gap-6">
          <h1 className="max-w-[420px] text-center text-[32px] font-extrabold leading-tight text-duo-gray md:text-[40px]">
            The most fun way to learn languages, chess, and more!
          </h1>

          <div className="flex w-full max-w-[330px] flex-col gap-4">
            <Button variant="green" size="lg" href="/learn" fullWidth>
              Get Started
            </Button>
            <Button variant="white" size="lg" href="/login" fullWidth>
              I already have an account
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
