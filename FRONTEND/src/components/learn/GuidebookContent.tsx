import Link from "next/link";

export function GuidebookContent() {
  return (
    <div className="flex min-h-full flex-col px-4 pb-12 pt-6 md:px-6">
      <Link
        href="/learn/japanese"
        className="mb-8 inline-flex items-center gap-2 text-[15px] font-bold text-[#1cb0f6] hover:underline"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/illustrations/back-arrow.svg"
          alt=""
          width={16}
          height={16}
          className="h-4 w-4"
          aria-hidden
        />
        Back
      </Link>

      <div className="mx-auto flex w-full max-w-[680px] min-h-[70vh] flex-col items-center justify-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/illustrations/path-owl.svg"
          alt=""
          width={360}
          height={360}
          className="mb-10 h-[360px] w-[360px]"
          aria-hidden
        />

        <p className="max-w-[480px] text-[19px] font-bold leading-relaxed text-white">
          Guidance is never free, it comes with expectations
        </p>
      </div>
    </div>
  );
}
