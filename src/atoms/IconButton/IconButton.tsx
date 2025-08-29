import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";

type IconType = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { className?: string }
>;

export type IconButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "success"
  | "warning"
  | "danger"
  | "brand";

export type IconButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface IconButtonProps
  extends Omit<HTMLMotionProps<"button">, "children" | "size"> {
  icon?: IconType;
  loading?: boolean;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  ariaLabel?: string;
  tooltip?: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon: Icon,
      loading = false,
      disabled = false,
      variant = "primary",
      size = "md",
      className = "",
      ariaLabel,
      tooltip,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = [
      "inline-flex items-center justify-center rounded-full select-none",
      "transition-all duration-200 ease-in-out",
      "focus:outline-none focus:ring-2 focus:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
    ];

    // Variants
    const variantStyles: Record<IconButtonVariant, string[]> = {
      primary: [
        "bg-brand-600 text-white shadow-sm",
        "hover:bg-brand-700 hover:shadow",
        "focus:ring-brand-500",
      ],
      secondary: [
        "bg-white text-gray-700 border border-gray-300 shadow-sm",
        "hover:bg-gray-50 hover:border-gray-400",
        "focus:ring-blue-500",
        "dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600",
        "dark:hover:bg-gray-700 dark:hover:border-gray-500",
      ],
      outline: [
        "bg-transparent text-gray-700 border border-gray-300",
        "hover:bg-gray-50 hover:border-gray-400",
        "focus:ring-blue-500",
        "dark:text-gray-300 dark:border-gray-600",
        "dark:hover:bg-gray-800 dark:hover:border-gray-500",
      ],
      ghost: [
        "bg-transparent text-gray-600",
        "hover:bg-gray-100 hover:text-gray-900",
        "focus:ring-blue-500",
        "dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white",
      ],
      success: [
        "bg-green-600 text-white shadow-sm",
        "hover:bg-green-700 hover:shadow",
        "focus:ring-green-500",
      ],
      warning: [
        "bg-amber-500 text-white shadow-sm",
        "hover:bg-amber-600 hover:shadow",
        "focus:ring-amber-500",
      ],
      danger: [
        "bg-red-600 text-white shadow-sm",
        "hover:bg-red-700 hover:shadow",
        "focus:ring-red-500",
      ],
      brand: [
        "bg-brand-gradient text-white shadow-md",
        "hover:shadow-lg hover:scale-[1.05]",
        "focus:ring-brand-500",
      ],
    };

    const safeVariant = variant in variantStyles ? variant : "primary";

    // Sizes
    const sizeStyles: Record<IconButtonSize, string> = {
      xs: "p-1 w-7 h-7",
      sm: "p-1.5 w-8 h-8",
      md: "p-2 w-10 h-10",
      lg: "p-2.5 w-12 h-12",
      xl: "p-3 w-14 h-14",
    };

    const iconSizes: Record<IconButtonSize, string> = {
      xs: "w-3.5 h-3.5",
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
      xl: "w-7 h-7",
    };

    const safeSize = size in sizeStyles ? size : "md";

    const buttonStyles = [
      ...baseStyles,
      ...variantStyles[safeVariant],
      sizeStyles[safeSize],
      className,
    ].join(" ");

    const iconSize = iconSizes[safeSize];

    return (
      <motion.button
        ref={ref}
        type="button"
        className={buttonStyles}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        aria-busy={loading}
        whileTap={disabled || loading ? {} : { scale: 0.9 }}
        {...props}
      >
        {loading ? (
          <svg
            className={`animate-spin ${iconSize}`}
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          Icon && <Icon className={iconSize} aria-hidden="true" />
        )}
        {tooltip && (
          <span className="sr-only" role="tooltip">
            {tooltip}
          </span>
        )}
      </motion.button>
    );
  }
);

IconButton.displayName = "IconButton";
