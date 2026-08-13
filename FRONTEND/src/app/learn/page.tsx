import { Navbar } from "@/components/landing/Navbar";

export default function LearnPage() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20">
        <div className="text-center">
          <h1 className="mb-4 text-[32px] font-extrabold text-duo-green">
            Coming Soon
          </h1>
          <p className="text-lg text-duo-gray-light">
            The learning path and lesson player are under construction.
          </p>
        </div>
      </main>
    </>
  );
}
