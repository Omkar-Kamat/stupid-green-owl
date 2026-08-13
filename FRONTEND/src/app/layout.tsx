import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stupid Green Owl",
  description:
    "Learn languages, chess, and more with stupid-green-owl. Free. Fun. Effective.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
