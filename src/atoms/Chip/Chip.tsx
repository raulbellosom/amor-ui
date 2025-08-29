// Chip.tsx
import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { X } from "lucide-react";

export type ChipSize = "xs" | "sm" | "md" | "lg";
export type ChipVariant = "outlined" | "filled";
export type ChipColor =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger";

type BaseProps = {
  /** Contenido principal del chip (texto/label). */
  label?: React.ReactNode;
  /** Valor asociado al chip (se pasa en onClick/onDismiss). */
  value?: string | number;
  /** Estado seleccionado (aria-pressed). */
  selected?: boolean;
  disabled?: boolean;
  /** Muestra botón de cierre. */
  dismissible?: boolean;
  /** Icono inicial (Lucide). */
  icon?: LucideIcon;
  /** Contador opcional (número a la derecha). */
  counter?: number | string;
  size?: ChipSize;
  variant?: ChipVariant;
  color?: ChipColor;
  className?: string;
  id?: string;

  /** Click en el chip (devuelve value o, si no hay, el label string). */
  onClick?: (
    value: string | number | undefined,
    e: React.MouseEvent<HTMLSpanElement>
  ) => void;

  /** Click en el botón de cierre. */
  onDismiss?: (
    value: string | number | undefined,
    e: React.MouseEvent<HTMLButtonElement>
  ) => void;
};

type SpanProps = BaseProps &
  Omit<React.HTMLAttributes<HTMLSpanElement>, "onClick"> & {
    /** Usa <span> sin motion. */
    asMotion?: false;
  };

type MotionSpanProps = BaseProps &
  Omit<HTMLMotionProps<"span">, "onClick" | "ref"> & {
    /** Usa <motion.span> con props de motion. */
    asMotion: true;
  };

export type ChipProps = SpanProps | MotionSpanProps;

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const sizeStyles: Record<ChipSize, string> = {
  xs: "px-2 py-0.5 text-xs gap-1",
  sm: "px-2.5 py-1 text-sm gap-1.5",
  md: "px-3 py-1.5 text-sm gap-2",
  lg: "px-4 py-2 text-base gap-2.5",
};

const iconSizes: Record<ChipSize, string> = {
  xs: "w-3 h-3",
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

const colorVariants: Record<
  ChipColor,
  {
    outlined: string;
    filled: string;
  }
> = {
  default: {
    outlined: cx(
      "bg-white border-gray-300 text-gray-700",
      "hover:bg-gray-50 hover:border-gray-400",
      "dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300",
      "dark:hover:bg-gray-700 dark:hover:border-gray-500"
    ),
    filled: cx(
      "bg-gray-100 border-transparent text-gray-800",
      "hover:bg-gray-200",
      "dark:bg-gray-700 dark:text-gray-200",
      "dark:hover:bg-gray-600"
    ),
  },
  primary: {
    outlined: cx(
      "bg-white border-blue-300 text-blue-700",
      "hover:bg-blue-50 hover:border-blue-400",
      "dark:bg-gray-800 dark:border-blue-600 dark:text-blue-300",
      "dark:hover:bg-gray-700 dark:hover:border-blue-500"
    ),
    filled: cx(
      "bg-blue-500 border-transparent text-white",
      "hover:bg-blue-600",
      "dark:bg-blue-500 dark:text-white",
      "dark:hover:bg-blue-600"
    ),
  },
  success: {
    outlined: cx(
      "bg-white border-green-300 text-green-700",
      "hover:bg-green-50 hover:border-green-400",
      "dark:bg-gray-800 dark:border-green-600 dark:text-green-300",
      "dark:hover:bg-gray-700 dark:hover:border-green-500"
    ),
    filled: cx(
      "bg-green-500 border-transparent text-white",
      "hover:bg-green-600",
      "dark:bg-green-500 dark:text-white",
      "dark:hover:bg-green-600"
    ),
  },
  warning: {
    outlined: cx(
      "bg-white border-yellow-300 text-yellow-700",
      "hover:bg-yellow-50 hover:border-yellow-400",
      "dark:bg-gray-800 dark:border-yellow-600 dark:text-yellow-300",
      "dark:hover:bg-gray-700 dark:hover:border-yellow-500"
    ),
    filled: cx(
      "bg-yellow-500 border-transparent text-white",
      "hover:bg-yellow-600",
      "dark:bg-yellow-500 dark:text-white",
      "dark:hover:bg-yellow-600"
    ),
  },
  danger: {
    outlined: cx(
      "bg-white border-red-300 text-red-700",
      "hover:bg-red-50 hover:border-red-400",
      "dark:bg-gray-800 dark:border-red-600 dark:text-red-300",
      "dark:hover:bg-gray-700 dark:hover:border-red-500"
    ),
    filled: cx(
      "bg-red-500 border-transparent text-white",
      "hover:bg-red-600",
      "dark:bg-red-500 dark:text-white",
      "dark:hover:bg-red-600"
    ),
  },
};

export const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  (props, ref) => {
    const {
      label,
      value,
      selected = false,
      disabled = false,
      dismissible = false,
      onClick,
      onDismiss,
      icon: Icon,
      counter,
      size = "md",
      variant = "outlined",
      color = "default",
      className,
      id,
      asMotion,
      ...rest
    } = props;

    const autoId = React.useId();
    const chipId = id ?? `chip-${autoId}`;

    const safeSize: ChipSize = sizeStyles[size] ? size : "md";
    const safeVariant: ChipVariant =
      variant === "filled" ? "filled" : "outlined";
    const safeColor: ChipColor = colorVariants[color] ? color : "default";

    const baseStyles = cx(
      "inline-flex items-center border rounded-full font-medium transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
      onClick && !disabled && "cursor-pointer",
      disabled && "cursor-not-allowed"
    );

    // Estados selected/disabled afectan solo el color de fondo/borde vía utilidades ya incluidas arriba
    const colorClass = colorVariants[safeColor][safeVariant];

    const chipStyles = cx(
      baseStyles,
      sizeStyles[safeSize],
      colorClass,
      className
    );

    const iconClass = iconSizes[safeSize];

    const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
      if (disabled) return;
      onClick?.(value ?? (typeof label === "string" ? label : undefined), e);
    };

    const handleDismiss = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onDismiss?.(value ?? (typeof label === "string" ? label : undefined), e);
    };

    const commonProps = {
      ref,
      id: chipId,
      className: chipStyles,
      onClick: onClick ? handleClick : undefined,
      role: onClick ? "button" : undefined,
      tabIndex: onClick && !disabled ? 0 : undefined,
      "aria-pressed": selected || undefined,
      "aria-disabled": disabled || undefined,
      onKeyDown: onClick
        ? (e: React.KeyboardEvent<HTMLSpanElement>) => {
            if (!disabled && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              handleClick(e as unknown as React.MouseEvent<HTMLSpanElement>);
            }
          }
        : undefined,
    };

    const Content = (
      <>
        {Icon && <Icon className={iconClass} aria-hidden="true" />}
        {label && <span className="font-medium">{label}</span>}
        {counter !== undefined && (
          <span className="font-semibold opacity-80">{counter}</span>
        )}
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className={cx(
              "ml-1 flex items-center justify-center rounded-full",
              "hover:bg-black/10 dark:hover:bg-white/10",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
              "transition-colors duration-200",
              iconClass
            )}
            aria-label={
              typeof label === "string" ? `Remove ${label}` : "Remove chip"
            }
          >
            <X className={iconClass} aria-hidden="true" />
          </button>
        )}
      </>
    );

    if (asMotion) {
      return (
        <motion.span {...(rest as HTMLMotionProps<"span">)} {...commonProps}>
          {Content}
        </motion.span>
      );
    }

    return (
      <span
        {...(rest as React.HTMLAttributes<HTMLSpanElement>)}
        {...commonProps}
      >
        {Content}
      </span>
    );
  }
);

Chip.displayName = "Chip";

export default Chip;
