import { UserStatsProvider } from "@/components/providers/UserStatsProvider";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <UserStatsProvider>{children}</UserStatsProvider>;
}
