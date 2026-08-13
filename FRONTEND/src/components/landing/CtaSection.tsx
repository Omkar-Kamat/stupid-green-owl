import { Button } from "@/components/ui/Button";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-white pb-0 pt-16 md:pt-24">
      <div className="mx-auto flex max-w-[1080px] flex-col items-center px-6 md:px-10">
        <h2 className="mb-8 text-center text-[32px] font-extrabold lowercase leading-tight text-duo-green md:text-[48px]">
          learn a language with stupid-green-owl
        </h2>

        <Button variant="green" size="lg" href="/learn" className="mb-12">
          Get Started
        </Button>
      </div>

      {/* Green background with curved top */}
      <div className="relative bg-duo-green">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="absolute -top-[1px] left-0 w-full h-[120px]"
          aria-hidden="true"
        >
          <path
            d="M0,120 L0,60 Q720,120 1440,60 L1440,120 Z"
            fill="#4b4b4b"
          />
          <path
            d="M0,0 L0,60 Q720,0 1440,60 L1440,0 Z"
            fill="white"
          />
        </svg>
        <div className="h-32 md:h-48" />
      </div>
    </section>
  );
}
