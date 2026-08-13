import { type ReactNode } from "react";

interface FeatureSectionProps {
  title: string;
  description: string;
  illustration: ReactNode;
  reversed?: boolean;
}

export function FeatureSection({
  title,
  description,
  illustration,
  reversed = false,
}: FeatureSectionProps) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div
        className={`mx-auto flex max-w-[1080px] flex-col items-center gap-10 px-6 md:flex-row md:gap-16 md:px-10 ${
          reversed ? "md:flex-row-reverse" : ""
        }`}
      >
        <div className="flex flex-1 justify-center">{illustration}</div>

        <div className="flex flex-1 flex-col justify-center">
          <h2 className="mb-6 text-[36px] font-extrabold lowercase leading-tight text-duo-green md:text-[48px]">
            {title}
          </h2>
          <p className="max-w-[480px] text-lg leading-relaxed text-duo-gray-light">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
