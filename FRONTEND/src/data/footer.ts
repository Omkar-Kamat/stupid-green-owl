export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "About us",
    links: [
      { label: "Courses", href: "#" },
      { label: "Mission", href: "#" },
      { label: "Approach", href: "#" },
      { label: "Efficacy", href: "#" },
      { label: "Duolingo Handbook", href: "#" },
      { label: "Research", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Brand guidelines", href: "#" },
      { label: "Store", href: "#" },
      { label: "Press", href: "#" },
      { label: "Investors", href: "#" },
      { label: "Contact us", href: "#" },
    ],
  },
  {
    title: "Products",
    links: [
      { label: "Duolingo", href: "#" },
      { label: "Duolingo for Schools", href: "#" },
      { label: "Duolingo English Test", href: "#" },
      { label: "Podcast", href: "#" },
      { label: "Duolingo for Business", href: "#" },
      { label: "Super Duolingo", href: "#" },
      { label: "Gift Super Duolingo", href: "#" },
      { label: "Duolingo Max", href: "#" },
    ],
  },
  {
    title: "Apps",
    links: [
      { label: "Duolingo for Android", href: "#" },
      { label: "Duolingo for iOS", href: "#" },
    ],
  },
  {
    title: "Help and support",
    links: [
      { label: "Duolingo FAQs", href: "#" },
      { label: "Schools FAQs", href: "#" },
      { label: "Duolingo English Test FAQs", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    title: "Privacy and terms",
    links: [
      { label: "Community guidelines", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Do Not Sell or Share My Personal Information", href: "#" },
    ],
  },
  {
    title: "Social",
    links: [
      { label: "Blog", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "TikTok", href: "#" },
      { label: "Twitter", href: "#" },
      { label: "YouTube", href: "#" },
      { label: "LinkedIn", href: "#" },
    ],
  },
];
