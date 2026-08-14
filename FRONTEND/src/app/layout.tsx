import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "Stupid Green Owl",
  description:
    "Learn languages, chess, and more with stupid-green-owl. Free. Fun. Effective.",
};

const themeInitScript = `(function(){try{var t=localStorage.getItem("sgo_theme");document.documentElement.dataset.theme=t==="light"?"light":"dark";}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full" data-theme="dark" suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased">
        <Script
          id="sgo-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
