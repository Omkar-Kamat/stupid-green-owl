export type LearnNavItem = {
  id: string;
  label: string;
  href: string;
  src?: string;
  useProfileIcon?: boolean;
};

export const LEARN_NAV_ITEMS: LearnNavItem[] = [
  { id: "learn", label: "Learn", src: "/illustrations/nav/learn.svg", href: "/learn/japanese" },
  {
    id: "characters",
    label: "Characters",
    src: "/illustrations/nav/characters.svg",
    href: "/learn/japanese/characters",
  },
  {
    id: "leaderboards",
    label: "Leaderboards",
    src: "/illustrations/nav/leaderboards.svg",
    href: "/learn/japanese/leaderboards",
  },
  { id: "quests", label: "Quests", src: "/illustrations/nav/quests.svg", href: "/learn/japanese/quests" },
  { id: "shop", label: "Shop", src: "/illustrations/nav/shop.svg", href: "/learn/japanese/shop" },
  {
    id: "profile",
    label: "Profile",
    href: "/learn/japanese/profile",
    useProfileIcon: true,
  },
];

export const MOBILE_NAV_ITEM_IDS = ["learn", "leaderboards", "quests", "shop", "profile"] as const;

export function getMobileNavItems(): LearnNavItem[] {
  return LEARN_NAV_ITEMS.filter((item) =>
    MOBILE_NAV_ITEM_IDS.includes(item.id as (typeof MOBILE_NAV_ITEM_IDS)[number]),
  );
}
