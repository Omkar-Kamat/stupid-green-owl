import { LearnRightPanel } from "@/components/learn/LearnRightPanel";
import { LearnSidebar } from "@/components/learn/LearnSidebar";
import {
  LEARN_STAT_ICONS,
  LanguagesLearningBadge,
  LearnStatIcon,
} from "@/components/learn/LearnStatBadge";

const LANGUAGES_LEARNING = 1;

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
          <StatPill>
            <LanguagesLearningBadge count={LANGUAGES_LEARNING} />
          </StatPill>
          <StatPill iconSrc={LEARN_STAT_ICONS.streak} value="1" color="text-[#ff9600]" />
          <StatPill iconSrc={LEARN_STAT_ICONS.gem} value="505" color="text-[#1cb0f6]" />
          <StatPill iconSrc={LEARN_STAT_ICONS.heart} value="4" color="text-[#ff4b4b]" />
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

function StatPill({
  children,
  iconSrc,
  value,
  color = "text-white",
}: {
  children?: React.ReactNode;
  iconSrc?: string;
  value?: string;
  color?: string;
}) {
  return (
    <div className={`flex items-center gap-2 text-[15px] font-bold ${color}`}>
      {children}
      {iconSrc && <LearnStatIcon src={iconSrc} className="h-6 w-6" />}
      {value !== undefined && <span>{value}</span>}
    </div>
  );
}
