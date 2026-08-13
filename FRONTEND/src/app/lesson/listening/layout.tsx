"use client";

/** UI prototype routes — not connected to the backend. See /lesson/[lessonId] for production. */
export default function PrototypeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-[#ffc800] px-4 py-2 text-center text-[12px] font-extrabold uppercase tracking-wide text-[#4b4b4b]">
        UI prototype — not connected to the backend
      </div>
      {children}
    </>
  );
}
