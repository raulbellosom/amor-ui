import * as React from "react";

type IconType = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { className?: string }
>;

export type TagVariant = "solid" | "soft" | "outline" | "glass";
export type TagColor =
  | "brand"
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info";
export type TagSize = "xs" | "sm" | "md" | "lg";

export interface TagProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "onClick" | "onToggle"> {
  children?: React.ReactNode;

  /** Apariencia */
  variant?: TagVariant;
  color?: TagColor;
  size?: TagSize;
  className?: string;

  /** Interacciones */
  onClick?: (e: React.MouseEvent) => void; // pulso (si no es seleccionable)
  selectable?: boolean;
  selected?: boolean;
  onToggle?: (next: boolean, e: React.MouseEvent | React.KeyboardEvent) => void;

  /** Cierre (×) */
  dismissible?: boolean;
  onRemove?: (e: React.MouseEvent) => void;

  /** Link (si se pasa href se renderiza <a>) */
  href?: string;
  target?: string;
  rel?: string;

  /** Decoradores */
  leadingIcon?: IconType;
  trailingIcon?: IconType;
  avatar?: React.ReactNode; // <img />, <Avatar />, etc.
  count?: number | React.ReactNode;

  disabled?: boolean;
}

/** Utilidad para concatenar clases */
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>((props, ref) => {
  const {
    children,
    variant = "soft",
    color = "neutral",
    size = "md",
    className = "",

    onClick,
    selectable = false,
    selected = false,
    onToggle,

    dismissible = false,
    onRemove,

    href,
    target,
    rel,

    leadingIcon: LeadingIcon,
    trailingIcon: TrailingIcon,
    avatar,
    count,

    disabled = false,
    ...rest
  } = props;

  const sizes: Record<
    TagSize,
    { px: string; text: string; gap: string; icon: string; close: string }
  > = {
    xs: {
      px: "px-2 py-0.5",
      text: "text-[11px]",
      gap: "gap-1",
      icon: "w-3.5 h-3.5",
      close: "w-3.5 h-3.5",
    },
    sm: {
      px: "px-2.5 py-1",
      text: "text-xs",
      gap: "gap-1.5",
      icon: "w-4 h-4",
      close: "w-4 h-4",
    },
    md: {
      px: "px-3 py-1.5",
      text: "text-sm",
      gap: "gap-2",
      icon: "w-4.5 h-4.5",
      close: "w-4.5 h-4.5" as any,
    },
    lg: {
      px: "px-3.5 py-2",
      text: "text-base",
      gap: "gap-2.5",
      icon: "w-5 h-5",
      close: "w-5 h-5",
    },
  };

  // Paletas por color usando tokens (se apoyan en tu theme)
  const palette = {
    brand: {
      solid: "bg-brand-600 text-white hover:bg-brand-700",
      soft: "bg-brand-50 text-brand-900 dark:bg-brand-900/20 dark:text-brand-100 hover:bg-brand-100/80",
      outline:
        "border border-brand-400 text-brand-800 dark:text-brand-200 hover:bg-brand-50/60",
      glass:
        "backdrop-blur bg-brand-500/15 text-brand-900 dark:text-brand-100 border border-brand-500/30",
      ring: "focus:ring-brand-500",
    },
    neutral: {
      solid: "bg-foreground/90 text-background hover:bg-foreground",
      soft: "bg-muted text-foreground hover:bg-muted/80",
      outline: "border border-border text-foreground hover:bg-muted/60",
      glass:
        "backdrop-blur bg-background/50 text-foreground border border-border/40",
      ring: "focus:ring-ring",
    },
    success: {
      solid: "bg-green-600 text-white hover:bg-green-700",
      soft: "bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100 hover:bg-green-100/80",
      outline:
        "border border-green-400 text-green-800 dark:text-green-200 hover:bg-green-50/60",
      glass:
        "backdrop-blur bg-green-500/15 text-green-900 dark:text-green-100 border border-green-500/30",
      ring: "focus:ring-green-500",
    },
    warning: {
      solid: "bg-amber-500 text-black hover:bg-amber-600",
      soft: "bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-100 hover:bg-amber-100/80",
      outline:
        "border border-amber-400 text-amber-800 dark:text-amber-200 hover:bg-amber-50/60",
      glass:
        "backdrop-blur bg-amber-500/15 text-amber-900 dark:text-amber-100 border border-amber-500/30",
      ring: "focus:ring-amber-500",
    },
    danger: {
      solid: "bg-red-600 text-white hover:bg-red-700",
      soft: "bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-100 hover:bg-red-100/80",
      outline:
        "border border-red-400 text-red-800 dark:text-red-200 hover:bg-red-50/60",
      glass:
        "backdrop-blur bg-red-500/15 text-red-900 dark:text-red-100 border border-red-500/30",
      ring: "focus:ring-red-500",
    },
    info: {
      solid: "bg-sky-600 text-white hover:bg-sky-700",
      soft: "bg-sky-50 text-sky-900 dark:bg-sky-900/20 dark:text-sky-100 hover:bg-sky-100/80",
      outline:
        "border border-sky-400 text-sky-800 dark:text-sky-200 hover:bg-sky-50/60",
      glass:
        "backdrop-blur bg-sky-500/15 text-sky-900 dark:text-sky-100 border border-sky-500/30",
      ring: "focus:ring-sky-500",
    },
  } as const;

  const tone = palette[color][variant];
  const ring = palette[color].ring;

  const SZ = sizes[size];
  const base = cx(
    "inline-flex items-center rounded-full select-none",
    "transition-colors duration-150",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
    SZ.px,
    SZ.text,
    SZ.gap,
    tone,
    disabled ? "opacity-60 pointer-events-none" : "cursor-default",
    className
  );

  const iconCls = cx("shrink-0", palette[color] ? "" : "", SZ.icon);
  const closeBtnCls = cx(
    "ml-1 inline-flex items-center justify-center rounded-full",
    "hover:bg-black/10 dark:hover:bg-white/10",
    "focus:outline-none",
    ring,
    SZ.close
  );

  // Determinar qué tag usar: <a> si hay href, <button> si es interactivo o selectable, <span> si es estático
  const interactive = !!onClick || selectable;
  const TagEl: any = href ? "a" : interactive ? "button" : "span";

  // Atributos de accesibilidad si es seleccionable
  const a11ySelectable = selectable
    ? {
        role: "switch" as const,
        "aria-checked": !!selected,
        tabIndex: disabled ? -1 : 0,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle?.(!selected, e);
          }
        },
      }
    : {};

  // Rel para links externos
  const isExternal = href && (target === "_blank" || /^https?:\/\//.test(href));
  const relAttr = isExternal
    ? [rel, "noopener", "noreferrer"].filter(Boolean).join(" ")
    : rel;

  // Click handler (toggle si es selectable; si no, onClick normal)
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    if (selectable) {
      onToggle?.(!selected, e);
    } else {
      onClick?.(e);
    }
  };

  return (
    <span className="inline-flex">
      <TagEl
        ref={ref as any}
        href={href}
        target={target}
        rel={relAttr}
        type={TagEl === "button" ? "button" : undefined}
        className={cx(base, ring, interactive || href ? "cursor-pointer" : "")}
        onClick={interactive || href ? handleClick : undefined}
        {...a11ySelectable}
        {...rest}
      >
        {/* Avatar / leading icon */}
        {avatar ? (
          <span className="shrink-0 -ml-1 mr-1 overflow-hidden rounded-full ring-1 ring-border">
            {avatar}
          </span>
        ) : LeadingIcon ? (
          <LeadingIcon className={iconCls} aria-hidden="true" />
        ) : null}

        {/* Label principal */}
        <span className="truncate">{children}</span>

        {/* Count / trailing icon */}
        {typeof count !== "undefined" && (
          <span className="ml-1 inline-flex items-center rounded-full px-1.5 py-0.5 text-[0.7em] bg-black/10 dark:bg-white/10">
            {count}
          </span>
        )}
        {TrailingIcon && (
          <TrailingIcon className={iconCls} aria-hidden="true" />
        )}

        {/* Indicador seleccionado (opcional sutil) */}
        {selectable && selected && (
          <span
            className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-current opacity-70"
            aria-hidden="true"
          />
        )}
      </TagEl>

      {/* Botón de cierre (dismissible) */}
      {dismissible && (
        <button
          type="button"
          onClick={onRemove}
          className={closeBtnCls}
          aria-label="Remove tag"
          disabled={disabled}
        >
          <svg
            viewBox="0 0 20 20"
            className="w-3.5 h-3.5"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M11.414 10l3.95-3.95-1.414-1.414L10 8.586 6.05 4.636 4.636 6.05 8.586 10l-3.95 3.95 1.414 1.414L10 11.414l3.95 3.95 1.414-1.414L11.414 10z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
});

Tag.displayName = "Tag";
export default Tag;
