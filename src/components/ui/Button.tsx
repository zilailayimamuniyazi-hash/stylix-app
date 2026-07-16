import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "ghost" | "outline";

const base = "ui-button";

const variants: Record<Variant, string> = {
  primary: "ui-button--primary",
  ghost: "ui-button--ghost",
  outline: "ui-button--secondary",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function Button({
  type = "button",
  children,
  variant = "primary",
  className = "",
  disabled,
  onClick,
}: {
  type?: "button" | "submit";
  children: ReactNode;
  variant?: Variant;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
