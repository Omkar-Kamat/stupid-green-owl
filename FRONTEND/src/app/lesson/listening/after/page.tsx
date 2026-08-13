import { IncorrectFeedbackBar } from "@/components/lesson/FeedbackBar";
import { LessonShell } from "@/components/lesson/LessonShell";
import {
  AnswerLine,
  AudioButtons,
  JapaneseWordTile,
  WordBank,
} from "@/components/lesson/WordTiles";

export default function ListeningAfterPage() {
  return (
    <LessonShell
      progress={80}
      hearts={1}
      footer={
        <IncorrectFeedbackBar
          romaji="sushito o cha kudasai"
          japanese="すしとおちゃ、ください。"
          meaning="Sushi and green tea, please."
        />
      }
    >
      <div className="mx-auto flex w-full max-w-[680px] flex-col items-center">
        <h1 className="mb-10 text-center text-[28px] font-extrabold text-white md:text-[32px]">
          Tap what you hear
        </h1>

        <AudioButtons />

        <AnswerLine>
          <JapaneseWordTile romaji="o cha" japanese="おちゃ" selected />
          <JapaneseWordTile romaji="to" japanese="と" selected />
          <JapaneseWordTile romaji="go ha n" japanese="ごはん" selected />
          <JapaneseWordTile romaji="ku da sa i" japanese="ください" selected />
        </AnswerLine>

        <WordBank>
          <JapaneseWordTile romaji="sushi" japanese="すし" />
          <JapaneseWordTile empty />
          <JapaneseWordTile empty />
          <JapaneseWordTile empty />
          <JapaneseWordTile empty />
        </WordBank>
      </div>
    </LessonShell>
  );
}
