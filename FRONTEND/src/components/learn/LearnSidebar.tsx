import Link from "next/link";
import { LEARN_NAV_ITEMS } from "@/components/learn/learnNavConfig";
import { ThemeToggleNavItem } from "@/components/theme/ThemeToggleNavItem";

type NavIconProps = { active?: boolean };

type SidebarOnlyItem =
  | { id: string; label: string; icon: (props: NavIconProps) => React.ReactElement; href?: string };

const MORE_ITEM: SidebarOnlyItem = { id: "more", label: "More", icon: MoreIcon };

export function LearnSidebar({ activeNav = "learn" }: { activeNav?: string }) {
  return (
    <aside className="hidden w-[256px] shrink-0 flex-col border-r border-duo-dark-border bg-duo-dark-bg md:flex">
      <div className="px-6 pb-2 pt-6">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <OwlMark />
          <span className="text-lg font-extrabold leading-tight text-duo-green">
            Stupid Green Owl
          </span>
        </Link>
      </div>

      <nav className="flex flex-col gap-0.5 px-3 pt-2">
        {LEARN_NAV_ITEMS.map((item) => renderNavItem(item, activeNav))}
        <ThemeToggleNavItem />
        {renderNavItem(MORE_ITEM, activeNav)}
      </nav>
    </aside>
  );
}

function renderNavItem(
  item: (typeof LEARN_NAV_ITEMS)[number] | SidebarOnlyItem,
  activeNav: string,
) {
  const { id, label } = item;
  const href = "href" in item ? item.href : undefined;
  const active = id === activeNav;
  const className = `flex items-center gap-4 rounded-2xl px-4 py-3 text-left text-[15px] font-bold uppercase tracking-wide transition-colors ${
    active
      ? "border-2 border-[#1cb0f6] bg-[#1cb0f6]/10 text-[#1cb0f6]"
      : "border-2 border-transparent text-[#52656d] hover:bg-white/5 hover:text-[#afafaf] [html[data-theme=light]_&]:text-[#777777] [html[data-theme=light]_&]:hover:bg-black/5 [html[data-theme=light]_&]:hover:text-[#4b4b4b]"
  }`;

  const content = (
    <>
      {"useProfileIcon" in item && item.useProfileIcon ? (
        <ProfileIcon active={active} />
      ) : "src" in item && item.src ? (
        <NavIcon src={item.src} active={active} />
      ) : "icon" in item ? (
        <item.icon active={active} />
      ) : null}
      {label}
    </>
  );

  if (href) {
    return (
      <Link key={id} href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button key={id} type="button" className={className}>
      {content}
    </button>
  );
}

function OwlMark() {
  return (
    <svg viewBox="0 0 43 42" className="h-8 w-8 shrink-0" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M37.3594 19.7622C38.118 26.2177 34.1961 32.3076 28.0148 34.2725C21.8334 36.2375 15.1355 33.5235 12.0555 27.806C6.80378 28.0224 2.03485 24.9074 0.151875 20.1153C-0.0355183 19.6372 0.0167211 19.0978 0.292395 18.6644C0.568066 18.231 1.03386 17.9559 1.54536 17.9244L8.5501 17.4903L6.81109 11.9573C6.35173 10.4955 6.65383 8.89954 7.61558 7.707C8.57733 6.51449 10.0707 5.88421 11.5925 6.02852C15.3979 6.39217 17.925 6.37745 19.1737 5.98439C20.4225 5.59133 22.4657 4.17143 25.3034 1.72466C26.4651 0.724618 28.0496 0.376265 29.5208 0.797451C30.9921 1.21864 32.1533 2.35301 32.6116 3.81682L34.3329 9.30024L40.2256 5.67766C40.6627 5.40863 41.2016 5.36564 41.6752 5.56204C42.1488 5.75845 42.4998 6.17048 42.6192 6.67031C43.8037 11.6426 41.7173 16.8998 37.3594 19.7622ZM19.4363 37.6572L16.2393 36.1255C15.1209 35.6134 13.7988 36.0968 13.2706 37.2111C12.7423 38.3254 13.2036 39.6578 14.3064 40.203L17.5052 41.7338C18.6236 42.246 19.9458 41.7625 20.4741 40.6482C21.0023 39.5338 20.541 38.2014 19.4381 37.6563L19.4363 37.6572ZM41.7546 28.1652C41.2358 27.8701 40.6211 27.7943 40.0462 27.9545C39.4713 28.1148 38.9834 28.4979 38.6903 29.0192L36.9463 32.1119C36.3752 33.1914 36.7639 34.5298 37.8232 35.1319C38.8825 35.7339 40.2281 35.3811 40.8592 34.3358L42.6018 31.2427C43.2154 30.1574 42.8361 28.7797 41.7545 28.1651L41.7546 28.1652Z"
        fill="#afafaf"
      />
    </svg>
  );
}

function NavIcon({ src, active }: { src: string; active?: boolean }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={`h-7 w-7 shrink-0 object-contain ${active ? "" : "opacity-50 grayscale"}`}
    />
  );
}

function ProfileIcon({ active }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0" fill={active ? "#ff86d0" : "#52656d"} aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6v1H4v-1z" />
    </svg>
  );
}

function MoreIcon({ active }: { active?: boolean }) {
  const fill = active ? "#1cb0f6" : "#52656d";
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0" aria-hidden="true">
      {[6, 12, 18].map((cx) => (
        <circle key={cx} cx={cx} cy="12" r="2" fill={fill} />
      ))}
    </svg>
  );
}
