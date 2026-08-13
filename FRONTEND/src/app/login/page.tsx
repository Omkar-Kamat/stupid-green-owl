"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-duo-dark-bg">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center text-2xl text-duo-gray-muted transition-colors hover:text-white"
          aria-label="Close"
        >
          ✕
        </Link>
        <Button variant="outline" size="sm" href="/learn">
          Sign Up
        </Button>
      </header>

      {/* Login form */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-[400px]">
          <h1 className="mb-8 text-center text-[28px] font-extrabold text-white">
            Log in
          </h1>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Email or username"
              className="w-full rounded-2xl border-2 border-duo-dark-border bg-duo-dark-input px-4 py-4 text-[16px] text-white placeholder:text-duo-gray-muted focus:border-duo-blue focus:outline-none"
            />

            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                className="w-full rounded-2xl border-2 border-duo-dark-border bg-duo-dark-input px-4 py-4 pr-24 text-[16px] text-white placeholder:text-duo-gray-muted focus:border-duo-blue focus:outline-none"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-bold uppercase tracking-wide text-duo-gray-muted hover:text-white"
              >
                Forgot?
              </button>
            </div>

            <Button variant="blue" size="lg" fullWidth className="mt-2">
              Log In
            </Button>
          </form>

          {/* OR divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-duo-dark-border" />
            <span className="text-[13px] font-bold uppercase tracking-wide text-duo-gray-muted">
              or
            </span>
            <div className="h-px flex-1 bg-duo-dark-border" />
          </div>

          {/* Social login */}
          <div className="flex gap-4">
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-duo-dark-border border-b-4 bg-duo-dark-input px-4 py-3.5 text-[13px] font-bold uppercase tracking-wide text-duo-blue transition-all hover:bg-duo-dark-border/30 active:border-b-2 active:translate-y-[2px]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>

            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-duo-dark-border border-b-4 bg-duo-dark-input px-4 py-3.5 text-[13px] font-bold uppercase tracking-wide text-[#1877F2] transition-all hover:bg-duo-dark-border/30 active:border-b-2 active:translate-y-[2px]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#1877F2" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>

          {/* Legal text */}
          <p className="mt-10 text-center text-[13px] leading-relaxed text-duo-gray-muted">
            By signing in to Duolingo, you agree to our{" "}
            <a href="#" className="underline hover:text-white">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-white">
              Privacy Policy
            </a>
            .
          </p>
          <p className="mt-4 text-center text-[11px] leading-relaxed text-duo-gray-muted/70">
            This site is protected by reCAPTCHA Enterprise and the Google{" "}
            <a href="#" className="underline hover:text-white">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-white">
              Terms of Service
            </a>{" "}
            apply.
          </p>
        </div>
      </main>
    </div>
  );
}
