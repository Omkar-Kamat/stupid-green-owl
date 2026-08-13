import { Logo } from "@/components/ui/Logo";
import { SiteLanguageDropdown } from "@/components/landing/SiteLanguageDropdown";

export function LearnHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-duo-gray-border bg-white">
      <div className="mx-auto flex h-[70px] max-w-[1080px] items-center justify-between px-6 md:px-10">
        <Logo />
        <SiteLanguageDropdown />
      </div>
    </header>
  );
}
