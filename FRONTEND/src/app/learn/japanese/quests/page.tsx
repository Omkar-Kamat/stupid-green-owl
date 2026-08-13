import { LearnAppShell } from "@/components/learn/LearnAppShell";
import { QuestsContent } from "@/components/learn/QuestsContent";
import { QuestsRightPanel } from "@/components/learn/QuestsRightPanel";

export default function QuestsPage() {
  return (
    <LearnAppShell activeNav="quests" rightPanel={<QuestsRightPanel />}>
      <QuestsContent />
    </LearnAppShell>
  );
}
