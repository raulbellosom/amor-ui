import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";

type IconType = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { className?: string }
>;

export type BadgeVariant =
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "outline"
  | "dot"
  | "brand"
  | "premium"
  | "featured"
  | "neutral";

export type BadgeSize = "xs" | "sm" | "md" | "lg" | "xl";

type BaseProps = {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: IconType;
  className?: string;
};

type SpanProps = BaseProps &
  React.HTMLAttributes<HTMLSpanElement> & {
    /** Usa elemento <span> estándar (sin motion). */
    asMotion?: false;
  };

type MotionSpanProps = BaseProps &
  Omit<HTMLMotionProps<"span">, "ref"> & {
    /** Usa <motion.span> con props de motion. */
    asMotion: true;
  };

export type BadgeProps = SpanProps | MotionSpanProps;

const base =
  "inline-flex items-center gap-1.5 font-medium rounded-full transition-all duration-200 ease-in-out";

const variants: Record<BadgeVariant, string> = {
  primary:
    "bg-brand-100 text-brand-800 border border-brand-200 dark:bg-brand-900/50 dark:text-brand-300 dark:border-brand-800",
  secondary:
    "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  info: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800",
  success:
    "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800",
  warning:
    "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800",
  danger:
    "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800",
  outline:
    "bg-transparent text-gray-700 border border-gray-300 dark:text-gray-300 dark:border-gray-600",
  dot: "bg-transparent text-gray-700 pl-0 dark:text-gray-300",
  brand:
    "bg-blue-600 text-white border border-blue-600 dark:bg-blue-500 dark:border-blue-500",
  premium:
    "bg-gradient-to-r from-amber-400 to-orange-500 text-white border border-amber-400 shadow-md",
  featured:
    "bg-gradient-to-r from-purple-500 to-pink-500 text-white border border-purple-500 shadow-md",
  neutral:
    "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
};

const sizes: Record<BadgeSize, string> = {
  xs: "px-1.5 py-0.5 text-xs",
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
  xl: "px-4 py-2 text-lg",
};

const iconSizes: Record<BadgeSize, string> = {
  xs: "w-2.5 h-2.5",
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
  xl: "w-6 h-6",
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (props, ref) => {
    const {
      children,
      variant = "info",
      size = "md",
      icon: Icon,
      className,
      asMotion,
      ...rest
    } = props as BadgeProps;

    const safeVariant: BadgeVariant = variants[variant] ? variant : "info";
    const safeSize: BadgeSize = sizes[size] ? size : "md";

    const classes = cx(base, variants[safeVariant], sizes[safeSize], className);
    const iconClass = iconSizes[safeSize];

    // Dot-only leading marker (no border, small circle)
    const Dot = () => (
      <span
        aria-hidden="true"
        className={cx(
          "inline-block rounded-full",
          safeSize === "xs"
            ? "w-1.5 h-1.5"
            : safeSize === "sm"
            ? "w-2 h-2"
            : safeSize === "md"
            ? "w-2.5 h-2.5"
            : safeSize === "lg"
            ? "w-3 h-3"
            : "w-3.5 h-3.5",
          // color of the dot follows text color for outline/dot, or bg for filled
          safeVariant === "outline" || safeVariant === "dot"
            ? "bg-current"
            : "bg-current"
        )}
      />
    );

    if (asMotion) {
      // Motion version (types seguros sin mezclar con HTMLAttributes)
      return (
        <motion.span
          ref={ref}
          className={classes}
          {...(rest as HTMLMotionProps<"span">)}
        >
          {safeVariant === "dot" && <Dot />}
          {Icon && <Icon className={iconClass} aria-hidden="true" />}
          {children}
        </motion.span>
      );
    }

    // Versión estándar sin motion
    return (
      <span
        ref={ref}
        className={classes}
        {...(rest as React.HTMLAttributes<HTMLSpanElement>)}
      >
        {safeVariant === "dot" && <Dot />}
        {Icon && <Icon className={iconClass} aria-hidden="true" />}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;
