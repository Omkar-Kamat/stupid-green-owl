"use client";

import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "green" | "white" | "blue" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  children: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  green:
    "bg-duo-green text-white border-b-4 border-duo-green-dark hover:bg-[#5a5a5a] active:border-b-2 active:translate-y-[2px]",
  white:
    "bg-white text-duo-blue border-2 border-duo-gray-border border-b-4 hover:bg-gray-50 active:border-b-2 active:translate-y-[2px]",
  blue: "bg-duo-blue text-white border-b-4 border-duo-blue-dark hover:bg-[#2fc0ff] active:border-b-2 active:translate-y-[2px]",
  outline:
    "bg-transparent text-white border-2 border-duo-gray-muted border-b-4 hover:bg-white/5 active:border-b-2 active:translate-y-[2px]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm min-w-[120px]",
  md: "px-6 py-3 text-[15px] min-w-[150px]",
  lg: "px-8 py-4 text-base min-w-[330px]",
};

export function Button({
  variant = "green",
  size = "md",
  href,
  children,
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center rounded-2xl font-bold uppercase tracking-wide transition-all cursor-pointer select-none",
    variantStyles[variant],
    sizeStyles[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
