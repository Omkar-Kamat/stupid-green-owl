import { PersonalizedIllustration } from "@/components/illustrations/PersonalizedIllustration";
import { ScienceIllustration } from "@/components/illustrations/ScienceIllustration";
import { MotivatedIllustration } from "@/components/illustrations/MotivatedIllustration";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LanguageBar } from "@/components/landing/LanguageBar";
import { MainHero } from "@/components/landing/MainHero";
import { FreeFunEffective } from "@/components/landing/FreeFunEffective";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <>
      <LandingHeader />
      <div className="flex min-h-[calc(100vh-70px)] flex-col bg-white">
        <MainHero />
        <LanguageBar />
      </div>

      <main>
        <FreeFunEffective />
        <FeatureSection
          title="personalized learning"
          description="Combining the best of AI and language science, lessons are tailored to help you learn at just the right level and pace."
          illustration={<PersonalizedIllustration />}
        />
        <FeatureSection
          title="backed by science"
          description="We use a combination of research-backed teaching methods and delightful content to create courses that effectively teach reading, writing, listening, and speaking skills!"
          illustration={<ScienceIllustration />}
        />
        <FeatureSection
          title="stay motivated"
          description="We make it easy to form a habit of language learning with game-like features, fun challenges, and reminders from our friendly mascot, Duo the owl."
          illustration={<MotivatedIllustration />}
          reversed
        />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
