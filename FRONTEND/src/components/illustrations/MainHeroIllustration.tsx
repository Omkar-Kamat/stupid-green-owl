import { IllustrationImage } from "@/components/illustrations/IllustrationImage";

export function MainHeroIllustration() {
  return (
    <IllustrationImage
      src="/illustrations/hero.svg"
      width={1080}
      height={1080}
      priority
      className="h-auto w-full max-w-[520px]"
    />
  );
}
