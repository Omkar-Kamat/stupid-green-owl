"use client";

import { useRouter } from "next/navigation";
import { type ComponentProps, type MouseEvent } from "react";
import { Button } from "@/components/ui/Button";
import { signInAsDemoUser } from "@/lib/demoAuth";

type AuthButtonProps = ComponentProps<typeof Button> & {
  redirectTo: string;
  signIn?: boolean;
};

export function AuthButton({
  redirectTo,
  signIn = true,
  onClick,
  ...props
}: AuthButtonProps) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (signIn) {
      signInAsDemoUser();
    }
    onClick?.(event);
    router.push(redirectTo);
  };

  return <Button {...props} onClick={handleClick} />;
}
