import { LearnRightPanel } from "@/components/learn/LearnRightPanel";
import { LearnSidebar } from "@/components/learn/LearnSidebar";
import { LearnStatsBar } from "@/components/learn/LearnStatsBar";

export function LearnAppShell({
  children,
  activeNav = "learn",
  rightPanel,
}: {
  children: React.ReactNode;
  activeNav?: string;
  rightPanel?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-duo-dark-bg">
      <LearnSidebar activeNav={activeNav} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 px-5 py-4 lg:hidden">
          <LearnStatsBar />
        </header>

        <div className="flex flex-1 justify-center overflow-y-auto px-4 pb-8 lg:px-8">
          <div className="flex w-full max-w-[1169px]">
            <main className="min-w-0 flex-1 overflow-x-hidden">
              {children}
            </main>

            <aside className="hidden w-[429px] shrink-0 pt-8 lg:block">
              {rightPanel ?? <LearnRightPanel />}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
