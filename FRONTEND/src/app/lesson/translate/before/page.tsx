import { LessonShell } from "@/components/lesson/LessonShell";
import {
  BearCharacter,
  FuriganaText,
  SpeechBubble,
} from "@/components/lesson/LessonCharacters";
import {
  CheckButton,
  LessonActionFooter,
  SkipButton,
} from "@/components/lesson/LessonFooter";
import {
  AnswerLine,
  EnglishWordTile,
  WordBank,
} from "@/components/lesson/WordTiles";

export default function TranslateBeforePage() {
  return (
    <LessonShell
      progress={60}
      hearts={3}
      footer={
        <LessonActionFooter left={<SkipButton />} right={<CheckButton />} />
      }
    >
      <div className="mx-auto flex w-full max-w-[760px] flex-col items-center">
        <h1 className="mb-10 text-center text-[28px] font-extrabold text-white md:text-[32px]">
          Write this in English
        </h1>

        <div className="mb-10 flex w-full items-center justify-center gap-4">
          <BearCharacter />
          <SpeechBubble>
            <FuriganaText
              segments={[
                { furigana: "mi zu", text: "みず" },
                { furigana: "to", text: "と" },
                { furigana: "o cha", text: "おちゃ" },
                { furigana: "", text: "、" },
                { furigana: "ku da sa i", text: "ください" },
                { furigana: "", text: "。" },
              ]}
            />
          </SpeechBubble>
        </div>

        <AnswerLine>
          <EnglishWordTile word="Water" />
          <EnglishWordTile word="and" />
          <EnglishWordTile word="green" />
          <EnglishWordTile word="tea" />
          <EnglishWordTile word="please" />
        </AnswerLine>

        <WordBank>
          <EnglishWordTile empty />
          <EnglishWordTile empty />
          <EnglishWordTile empty />
          <EnglishWordTile empty />
          <EnglishWordTile empty />
          <EnglishWordTile word="rice" />
        </WordBank>
      </div>
    </LessonShell>
  );
}
