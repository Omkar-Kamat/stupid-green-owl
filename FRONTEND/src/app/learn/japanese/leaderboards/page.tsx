import { LeaderboardContent } from "@/components/learn/LeaderboardContent";
import { LeaderboardRightPanel } from "@/components/learn/LeaderboardRightPanel";
import { LearnAppShell } from "@/components/learn/LearnAppShell";

export default function LeaderboardsPage() {
  return (
    <LearnAppShell activeNav="leaderboards" rightPanel={<LeaderboardRightPanel />}>
      <LeaderboardContent />
    </LearnAppShell>
  );
}
