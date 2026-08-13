import { CorrectFeedbackBar } from "@/components/lesson/FeedbackBar";
import { LessonShell } from "@/components/lesson/LessonShell";
import {
  BearCharacter,
  FuriganaText,
  SpeechBubble,
} from "@/components/lesson/LessonCharacters";
import {
  AnswerLine,
  EnglishWordTile,
  WordBank,
} from "@/components/lesson/WordTiles";

export default function TranslateAfterPage() {
  return (
    <LessonShell
      progress={65}
      hearts={4}
      streakLabel="4 IN A ROW"
      footer={<CorrectFeedbackBar message="Excellent!" />}
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
                { furigana: "o cha", text: "おちゃ" },
                { furigana: "to", text: "と" },
                { furigana: "mi zu", text: "みず" },
                { furigana: "", text: "、" },
                { furigana: "ku da sa i", text: "ください" },
                { furigana: "", text: "。" },
              ]}
            />
          </SpeechBubble>
        </div>

        <AnswerLine>
          <EnglishWordTile word="Green" />
          <EnglishWordTile word="tea" />
          <EnglishWordTile word="and" />
          <EnglishWordTile word="water" />
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
