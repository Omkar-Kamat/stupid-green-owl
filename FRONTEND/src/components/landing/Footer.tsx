import { FOOTER_COLUMNS } from "@/data/footer";
import { SITE_LANGUAGES } from "@/data/languages";

export function Footer() {
  return (
    <footer className="bg-duo-green text-white">
      <div className="mx-auto max-w-[1080px] px-6 py-12 md:px-10 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-[15px] font-bold">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="footer-link text-[15px] font-normal text-white/90 hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/30">
        <div className="mx-auto max-w-[1080px] px-6 py-8 md:px-10">
          <p className="mb-4 text-[15px] font-bold">Site language:</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {SITE_LANGUAGES.map((lang) => (
              <a
                key={lang}
                href="#"
                className="site-lang-link text-[15px] text-white/90 hover:text-white"
              >
                {lang}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
