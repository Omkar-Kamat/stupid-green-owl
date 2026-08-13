import { CharactersContent } from "@/components/learn/CharactersContent";
import { LearnAppShell } from "@/components/learn/LearnAppShell";

export default function CharactersPage() {
  return (
    <LearnAppShell activeNav="characters">
      <CharactersContent />
    </LearnAppShell>
  );
}
