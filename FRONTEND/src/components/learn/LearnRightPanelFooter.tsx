const FOOTER_ROW_ONE = ["About", "Blog", "Store", "Efficacy", "Careers"];
const FOOTER_ROW_TWO = ["Investors", "Terms", "Privacy"];

export function LearnRightPanelFooter() {
  return (
    <div className="flex flex-col items-center gap-3 px-2 pt-2">
      <FooterLinkRow links={FOOTER_ROW_ONE} />
      <FooterLinkRow links={FOOTER_ROW_TWO} />
    </div>
  );
}

function FooterLinkRow({ links }: { links: string[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
      {links.map((link) => (
        <a
          key={link}
          href="#"
          className="text-[11px] font-extrabold uppercase tracking-wide text-[#52656d] hover:text-[#afafaf]"
        >
          {link}
        </a>
      ))}
    </div>
  );
}
