// components/Button.tsx
//
// One component for every button-shaped thing in the app: a primary CTA,
// a secondary outline action, or a real <button type="submit">. Pass
// `href` to render a Next.js Link; leave it off to render a <button>.

import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary";

const VARIANT_STYLES: Record<Variant, string> = {
  primary: "bg-ink-950 text-paper hover:bg-ink-900",
  secondary: "border border-ink-950/20 text-ink-950 hover:border-ink-950/40",
};

const BASE_STYLES =
  "inline-flex items-center justify-center rounded-md px-5 py-3 font-body text-sm font-medium transition";

type CommonProps = {
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

type LinkButtonProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href"> & {
    href: string;
  };

type NativeButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    href?: undefined;
  };

type ButtonProps = LinkButtonProps | NativeButtonProps;

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const classes = `${BASE_STYLES} ${VARIANT_STYLES[variant]} ${className}`.trim();

  if ("href" in rest && rest.href) {
    const { href, ...anchorRest } = rest as LinkButtonProps;
    return (
      <Link href={href} className={classes} {...anchorRest}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonRest } = rest as NativeButtonProps;
  return (
    <button type={type} className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
