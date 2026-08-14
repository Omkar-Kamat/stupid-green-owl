import Link from "next/link";
import { getMobileNavItems } from "@/components/learn/learnNavConfig";

export function LearnMobileNav({ activeNav = "learn" }: { activeNav?: string }) {
  const items = getMobileNavItems();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-duo-dark-border bg-duo-dark-bg px-1 pb-[env(safe-area-inset-bottom,0px)] md:hidden"
    >
      {items.map((item) => {
        const active = item.id === activeNav;
        const className = `flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-bold uppercase tracking-wide transition-colors ${
          active
            ? "text-[#1cb0f6]"
            : "text-[#52656d] [html[data-theme=light]_&]:text-[#777777]"
        }`;

        return (
          <Link key={item.id} href={item.href} className={className}>
            {item.useProfileIcon ? (
              <ProfileNavIcon active={active} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.src}
                alt=""
                aria-hidden="true"
                className={`h-6 w-6 shrink-0 object-contain ${active ? "" : "opacity-50 grayscale"}`}
              />
            )}
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function ProfileNavIcon({ active }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill={active ? "#ff86d0" : "#52656d"} aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6v1H4v-1z" />
    </svg>
  );
}
