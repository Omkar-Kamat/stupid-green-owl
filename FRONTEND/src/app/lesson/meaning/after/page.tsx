import { CorrectFeedbackBar } from "@/components/lesson/FeedbackBar";
import { LessonShell } from "@/components/lesson/LessonShell";
import { LucyCharacter, SpeechBubble } from "@/components/lesson/LessonCharacters";
import {
  MeaningOptions,
  MultipleChoiceOption,
} from "@/components/lesson/MultipleChoice";

export default function MeaningAfterPage() {
  return (
    <LessonShell
      progress={33}
      hearts={4}
      streakLabel="3 IN A ROW"
      footer={<CorrectFeedbackBar message="Excellent!" />}
    >
      <div className="mx-auto flex w-full max-w-[760px] flex-col items-center">
        <h1 className="mb-10 text-center text-[28px] font-extrabold text-white md:text-[32px]">
          Select the correct meaning
        </h1>

        <div className="mb-10 flex w-full items-center justify-center gap-4">
          <LucyCharacter />
          <SpeechBubble showSpeaker={false}>
            <p className="text-[22px] font-bold text-white">water</p>
          </SpeechBubble>
        </div>

        <MeaningOptions>
          <MultipleChoiceOption number={1} romaji="o cha" japanese="おちゃ" />
          <MultipleChoiceOption number={2} romaji="mi zu" japanese="みず" correct />
          <MultipleChoiceOption number={3} romaji="ku da sa i" japanese="ください" />
        </MeaningOptions>
      </div>
    </LessonShell>
  );
}
