import { LessonShell } from "@/components/lesson/LessonShell";
import { ElderCharacter, SpeechBubble } from "@/components/lesson/LessonCharacters";
import {
  CheckButton,
  LessonActionFooter,
  SkipButton,
} from "@/components/lesson/LessonFooter";
import {
  MeaningOptions,
  MultipleChoiceOption,
} from "@/components/lesson/MultipleChoice";

export default function MeaningBeforePage() {
  return (
    <LessonShell
      progress={15}
      hearts={4}
      footer={
        <LessonActionFooter left={<SkipButton />} right={<CheckButton disabled />} />
      }
    >
      <div className="mx-auto flex w-full max-w-[760px] flex-col items-center">
        <h1 className="mb-10 text-center text-[28px] font-extrabold text-white md:text-[32px]">
          Select the correct meaning
        </h1>

        <div className="mb-10 flex w-full items-center justify-center gap-4">
          <ElderCharacter />
          <SpeechBubble showSpeaker={false}>
            <p className="text-[22px] font-bold text-white">and</p>
          </SpeechBubble>
        </div>

        <MeaningOptions>
          <MultipleChoiceOption number={1} romaji="go ha n" japanese="ごはん" />
          <MultipleChoiceOption number={2} romaji="to" japanese="と" />
          <MultipleChoiceOption number={3} romaji="ku da sa i" japanese="ください" />
        </MeaningOptions>
      </div>
    </LessonShell>
  );
}
