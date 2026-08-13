import { LearnAppShell } from "@/components/learn/LearnAppShell";
import { ProfileContent } from "@/components/learn/ProfileContent";
import { ProfileRightPanel } from "@/components/learn/ProfileRightPanel";

export default function ProfilePage() {
  return (
    <LearnAppShell activeNav="profile" rightPanel={<ProfileRightPanel />}>
      <ProfileContent />
    </LearnAppShell>
  );
}
