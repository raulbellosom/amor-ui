import * as React from "react";

type IconType = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { className?: string }
>;

export type LinkVariant =
  | "brand"
  | "neutral"
  | "muted"
  | "danger"
  | "breadcrumb";
export type LinkUnderline = "always" | "hover" | "none";
export type LinkSize = "sm" | "md" | "lg";

/**
 * Link accesible y tematizable (tokens + dark mode).
 * - Variantes: brand/neutral/muted/danger/breadcrumb
 * - Tamaños: sm/md/lg
 * - Subrayado: always | hover | none
 * - Estado activo: aria-current="page"
 * - Visited opcional
 * - Indicador externo opcional (target="_blank")
 */
export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  children?: React.ReactNode;
  variant?: LinkVariant;
  size?: LinkSize;
  underline?: LinkUnderline;
  active?: boolean;
  showVisited?: boolean;
  leadingIcon?: IconType;
  trailingIcon?: IconType;
  /** Muestra un pequeño indicador ↗ cuando el link es externo */
  externalIndicator?: boolean;
  /** Deshabilita interacción (renderiza <span role="link">) */
  disabled?: boolean;
  className?: string;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      children,
      href,
      variant = "brand",
      size = "md",
      underline = "hover",
      active = false,
      showVisited = true,
      leadingIcon: LeadingIcon,
      trailingIcon: TrailingIcon,
      externalIndicator = false,
      disabled = false,
      className = "",
      target,
      rel,
      ...props
    },
    ref
  ) => {
    const isExternal =
      target === "_blank" || (href?.startsWith("http") ?? false);
    const resolvedRel = isExternal
      ? [rel, "noopener", "noreferrer"].filter(Boolean).join(" ")
      : rel;

    // Base + accesibilidad (tokens de foco)
    const base = [
      "inline-flex items-center gap-1.5 rounded",
      "transition-colors duration-150",
      "focus:outline-none focus:ring-2 focus:ring-offset-2",
      // usa token de ring
      "focus:ring-ring",
      disabled ? "pointer-events-none opacity-60" : "cursor-pointer",
    ];

    const sizeStyles: Record<LinkSize, string> = {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    };

    const underlineStyles: Record<LinkUnderline, string> = {
      always: "underline underline-offset-2",
      hover: "no-underline hover:underline underline-offset-2",
      none: "no-underline",
    };

    // Variantes usando tokens: brand / neutral / muted / danger (+ breadcrumb)
    const variantStyles: Record<LinkVariant, string[]> = {
      brand: [
        "text-brand-600 hover:text-brand-700",
        "dark:text-brand-400 dark:hover:text-brand-300",
        showVisited
          ? "visited:text-purple-700 dark:visited:text-purple-400"
          : "",
        active ? "font-semibold" : "",
      ],
      neutral: [
        "text-gray-700 hover:text-gray-900",
        "dark:text-gray-300 dark:hover:text-white",
        showVisited ? "visited:text-gray-900 dark:visited:text-gray-100" : "",
        active ? "font-semibold" : "",
      ],
      muted: [
        "text-muted-foreground hover:text-foreground",
        "dark:text-muted-foreground dark:hover:text-foreground",
        active ? "font-semibold" : "",
      ],
      danger: [
        "text-danger hover:text-red-700",
        "dark:text-red-400 dark:hover:text-red-300",
        active ? "font-semibold" : "",
      ],
      breadcrumb: [
        "text-gray-600 hover:text-gray-900",
        "dark:text-gray-300 dark:hover:text-white",
        active ? "font-semibold" : "",
      ],
    };

    const iconSizes: Record<LinkSize, string> = {
      sm: "w-3.5 h-3.5",
      md: "w-4 h-4",
      lg: "w-5 h-5",
    };

    const classes = [
      ...base,
      sizeStyles[size],
      underlineStyles[underline],
      ...variantStyles[variant],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const ExternalMark = () =>
      externalIndicator && isExternal ? (
        <svg
          aria-hidden="true"
          className={iconSizes[size]}
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M14 3h7v7" stroke="currentColor" strokeWidth="2" />
          <path d="M10 14L21 3" stroke="currentColor" strokeWidth="2" />
          <path
            d="M21 14v7h-7M3 10V3h7"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0"
          />
        </svg>
      ) : null;

    if (disabled) {
      return (
        <span
          role="link"
          aria-disabled="true"
          className={classes}
          tabIndex={-1}
        >
          {LeadingIcon ? <LeadingIcon className={iconSizes[size]} /> : null}
          <span>{children}</span>
          {TrailingIcon ? <TrailingIcon className={iconSizes[size]} /> : null}
          <ExternalMark />
        </span>
      );
    }

    return (
      <a
        ref={ref}
        href={href}
        target={target}
        rel={resolvedRel}
        className={classes}
        aria-current={active ? "page" : undefined}
        {...props}
      >
        {LeadingIcon ? <LeadingIcon className={iconSizes[size]} /> : null}
        <span>{children}</span>
        {TrailingIcon ? <TrailingIcon className={iconSizes[size]} /> : null}
        <ExternalMark />
      </a>
    );
  }
);

Link.displayName = "Link";
export default Link;
