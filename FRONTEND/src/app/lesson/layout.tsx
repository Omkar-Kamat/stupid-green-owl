import { UserStatsProvider } from "@/components/providers/UserStatsProvider";

export default function LessonLayout({ children }: { children: React.ReactNode }) {
  return <UserStatsProvider>{children}</UserStatsProvider>;
}
