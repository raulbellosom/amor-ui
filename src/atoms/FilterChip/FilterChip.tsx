import * as React from "react";
import { motion, type HTMLMotionProps, type MotionStyle } from "motion/react";

/* ===================== Utils ===================== */
type ClassValue = string | false | null | undefined;
const cx = (...v: ClassValue[]) => v.filter(Boolean).join(" ");

type IconType = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { className?: string }
>;

function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T;
  defaultValue: T;
  onChange?: (v: T) => void;
}) {
  const [state, setState] = React.useState<T>(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? (value as T) : state;

  const set = React.useCallback(
    (next: T) => {
      if (!controlled) setState(next);
      onChange?.(next);
    },
    [controlled, onChange]
  );

  return [current, set] as const;
}

/* ===================== Tipos ===================== */

export type FilterChipSize = "xs" | "sm" | "md" | "lg";
export type FilterChipVariant =
  | "subtle"
  | "muted"
  | "brand"
  | "inverted"
  | "glass"
  | "outline"
  | "ghost"
  | "pill";

export interface FilterChipProps
  extends Omit<HTMLMotionProps<"button">, "onChange" | "onToggle"> {
  /** Estado controlado */
  selected?: boolean;
  /** Estado no controlado inicial */
  defaultSelected?: boolean;
  /** Toggle callback */
  onToggle?: (
    next: boolean,
    e:
      | React.MouseEvent<HTMLButtonElement>
      | React.KeyboardEvent<HTMLButtonElement>
  ) => void;

  /** Deshabilitar interacción */
  disabled?: boolean;

  /** Apariencia y tamaño */
  variant?: FilterChipVariant;
  size?: FilterChipSize;
  density?: "comfortable" | "compact";

  /** Íconos opcionales */
  leadingIcon?: IconType;
  trailingIcon?: IconType;

  /** Muestra un check automático cuando está seleccionado */
  showCheck?: boolean;

  /** Badge numérico (ej: resultados) */
  count?: number;

  /** Botón de cierre (p. ej. quitar filtro activo) */
  closable?: boolean;
  onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  closeLabel?: string;

  /** Texto accesible si el contenido es solo ícono */
  ariaLabel?: string;

  /** Truncar el contenido largo */
  truncate?: boolean;

  /** Clase extra para el badge */
  badgeClassName?: string;

  /** Contenido principal */
  children?: React.ReactNode;
}

/* ===================== Tokens visuales ===================== */

const SIZE_CLS: Record<FilterChipSize, string> = {
  xs: "text-[11px]",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const PAD_CLS: Record<FilterChipSize, string> = {
  xs: "h-7 rounded-md px-2",
  sm: "h-8 rounded-lg px-2.5",
  md: "h-9 rounded-xl px-3",
  lg: "h-10 rounded-2xl px-3.5",
};

const ICON_CLS: Record<FilterChipSize, string> = {
  xs: "w-3.5 h-3.5",
  sm: "w-4 h-4",
  md: "w-4.5 h-4.5",
  lg: "w-5 h-5",
};

const GAP_DENSITY: Record<"comfortable" | "compact", string> = {
  comfortable: "gap-1.5",
  compact: "gap-1",
};

const VARIANT_BASE: Record<FilterChipVariant, string> = {
  subtle:
    "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
  muted: "bg-muted text-foreground hover:bg-muted/80",
  brand:
    "bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 dark:bg-brand-950/30 dark:text-brand-300 dark:border-brand-900",
  inverted: "bg-white/10 text-white hover:bg-white/20 border border-white/20",
  glass:
    "backdrop-blur bg-white/10 text-foreground hover:bg-white/20 border border-white/20 dark:text-white",
  outline:
    "bg-transparent text-foreground border border-border hover:bg-muted/40",
  ghost:
    "bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
  pill: "bg-muted/60 text-foreground hover:bg-muted",
};

const VARIANT_SELECTED: Record<FilterChipVariant, string> = {
  subtle: "bg-muted text-foreground",
  muted: "bg-foreground text-background",
  brand: "bg-brand-600 text-white dark:bg-brand-500",
  inverted: "bg-white text-gray-900",
  glass: "bg-white/20 text-foreground dark:text-white",
  outline: "bg-foreground text-background border-foreground",
  ghost: "bg-muted text-foreground",
  pill: "bg-muted text-foreground font-medium",
};

const BADGE_CLS =
  "inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-medium";

/* ===================== Componente ===================== */

export const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  (
    {
      selected,
      defaultSelected = false,
      onToggle,
      disabled = false,
      variant = "subtle",
      size = "md",
      density = "comfortable",
      leadingIcon: LeadingIcon,
      trailingIcon: TrailingIcon,
      showCheck = true,
      count,
      closable = false,
      onClose,
      closeLabel = "Quitar",
      ariaLabel,
      truncate = true,
      badgeClassName,
      className,
      style,
      children,
      onClick,
      onKeyDown,
      ...motionProps
    },
    ref
  ) => {
    const [isSelected, setSelected] = useControllableState<boolean>({
      value: selected,
      defaultValue: defaultSelected,
      onChange: undefined,
    });

    const sizeCls = SIZE_CLS[size];
    const padCls = PAD_CLS[size];
    const gapCls = GAP_DENSITY[density];
    const iconCls = ICON_CLS[size];

    const base = cx(
      "inline-flex items-center select-none",
      padCls,
      sizeCls,
      gapCls,
      "transition-colors",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:opacity-50 disabled:cursor-not-allowed"
    );

    const visual = cx(
      isSelected ? VARIANT_SELECTED[variant] : VARIANT_BASE[variant],
      className
    );

    const handleToggle = (
      e:
        | React.MouseEvent<HTMLButtonElement>
        | React.KeyboardEvent<HTMLButtonElement>
    ) => {
      if (disabled) return;
      const next = !isSelected;
      setSelected(next);
      onToggle?.(next, e);
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      handleToggle(e);
      onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleToggle(e);
      }
      onKeyDown?.(e);
    };

    const contentIsIconOnly = !children && (!!LeadingIcon || !!TrailingIcon);

    return (
      <motion.button
        ref={ref}
        type="button"
        className={cx(base, visual)}
        style={style as MotionStyle}
        aria-pressed={isSelected}
        aria-label={contentIsIconOnly ? ariaLabel : undefined}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        whileTap={disabled ? {} : { scale: 0.97 }}
        {...motionProps}
      >
        {/* Leading icon / check */}
        {showCheck && isSelected ? (
          <CheckMini className={iconCls} aria-hidden />
        ) : LeadingIcon ? (
          <LeadingIcon className={iconCls} aria-hidden />
        ) : null}

        {/* Label */}
        {children ? (
          <span
            className={cx(
              "inline-flex items-center min-w-0",
              truncate && "truncate"
            )}
          >
            {children}
          </span>
        ) : null}

        {/* Badge de conteo */}
        {typeof count === "number" && (
          <span
            className={cx(
              BADGE_CLS,
              isSelected
                ? "bg-black/15 text-current dark:bg-white/20"
                : "bg-muted/70 text-muted-foreground",
              badgeClassName
            )}
          >
            {count}
          </span>
        )}

        {/* Trailing icon */}
        {TrailingIcon && !closable && (
          <TrailingIcon className={iconCls} aria-hidden />
        )}

        {/* Botón de cierre (cuando actúa como “filtro activo”) */}
        {closable && (
          <button
            type="button"
            className={cx(
              "ml-1 inline-grid place-items-center rounded-md",
              size === "xs"
                ? "w-5 h-5"
                : size === "sm"
                ? "w-5.5 h-5.5"
                : size === "md"
                ? "w-6 h-6"
                : "w-7 h-7",
              "hover:bg-black/5 dark:hover:bg-white/10"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onClose?.(e);
            }}
            aria-label={closeLabel}
          >
            <XMini className={iconCls} aria-hidden />
          </button>
        )}
      </motion.button>
    );
  }
);

FilterChip.displayName = "FilterChip";

/* ===================== Íconos mínimos (reemplazables por Lucide) ===================== */

function CheckMini(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 00-1.414 0L8.5 12.086 6.207 9.793A1 1 0 104.793 11.207l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function XMini(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M6.707 6.707a1 1 0 00-1.414-1.414L5 5.586 3.707 4.293A1 1 0 102.293 5.707L3.586 7l-1.293 1.293A1 1 0 103.707 9.707L5 8.414l1.293 1.293a1 1 0 001.414-1.414L6.414 7l1.293-1.293z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default FilterChip;
