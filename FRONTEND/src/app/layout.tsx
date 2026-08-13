import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Duolingo - The world's best way to learn a language",
  description:
    "Learn languages, chess, and more with Duolingo. Free. Fun. Effective.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
