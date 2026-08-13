"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { AuthButton } from "@/components/auth/AuthButton";
import { SiteLanguageDropdown } from "@/components/landing/SiteLanguageDropdown";

export function LandingHeader() {
  const [pastFlags, setPastFlags] = useState(false);

  useEffect(() => {
    const flagsBar = document.getElementById("language-bar");
    if (!flagsBar) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setPastFlags(
          !entry.isIntersecting && entry.boundingClientRect.top < 0,
        );
      },
      { threshold: 0 },
    );

    observer.observe(flagsBar);
    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-duo-gray-border bg-white">
      <div className="mx-auto flex h-[70px] max-w-[1080px] items-center justify-between px-6 md:px-10">
        <Logo />
        {pastFlags ? (
          <AuthButton variant="green" size="sm" redirectTo="/learn">
            Get Started
          </AuthButton>
        ) : (
          <SiteLanguageDropdown />
        )}
      </div>
    </header>
  );
}
