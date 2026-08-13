import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

interface NavbarProps {
  variant?: "default" | "withSiteLanguage";
}

export function Navbar({ variant = "default" }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-duo-gray-border bg-white">
      <div className="mx-auto flex h-[70px] max-w-[1080px] items-center justify-between px-6 md:px-10">
        <Logo />

        {variant === "withSiteLanguage" ? (
          <button
            type="button"
            className="flex items-center gap-1 text-[13px] font-bold uppercase tracking-wide text-duo-gray-muted hover:text-duo-gray"
          >
            Site language: English
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        ) : (
          <Button variant="green" size="sm" href="/learn">
            Get Started
          </Button>
        )}
      </div>
    </header>
  );
}
