import { GuidebookContent } from "@/components/learn/GuidebookContent";
import { LearnAppShell } from "@/components/learn/LearnAppShell";

export default function GuidebookPage() {
  return (
    <LearnAppShell activeNav="learn">
      <GuidebookContent />
    </LearnAppShell>
  );
}
