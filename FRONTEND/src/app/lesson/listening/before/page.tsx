import { LessonShell } from "@/components/lesson/LessonShell";
import {
  CantListenButton,
  CheckButton,
  LessonActionFooter,
  UseKeyboardButton,
} from "@/components/lesson/LessonFooter";
import {
  AnswerLine,
  AudioButtons,
  JapaneseWordTile,
  WordBank,
} from "@/components/lesson/WordTiles";

export default function ListeningBeforePage() {
  return (
    <LessonShell
      progress={80}
      hearts={2}
      footer={
        <LessonActionFooter
          left={<CantListenButton />}
          center={<UseKeyboardButton />}
          right={<CheckButton disabled />}
        />
      }
    >
      <div className="mx-auto flex w-full max-w-[680px] flex-col items-center">
        <h1 className="mb-10 text-center text-[28px] font-extrabold text-white md:text-[32px]">
          Tap what you hear
        </h1>

        <AudioButtons />

        <AnswerLine />

        <WordBank>
          <JapaneseWordTile romaji="sushi" japanese="すし" />
          <JapaneseWordTile romaji="mizu" japanese="みず" />
          <JapaneseWordTile romaji="gohan" japanese="ごはん" />
          <JapaneseWordTile romaji="to" japanese="と" />
        </WordBank>
      </div>
    </LessonShell>
  );
}
