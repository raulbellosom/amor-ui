// Spinner.tsx
import * as React from "react";

export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";
export type SpinnerVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "white"
  | "current";
export type SpinnerType = "circle" | "dots" | "pulse" | "bars";

export type SpinnerLabels = {
  /** Texto accesible anunciado por lectores de pantalla. */
  label?: string; // default: "Loading..."
  /** Aria-live politeness: 'polite' o 'assertive'. */
  live?: "polite" | "assertive" | "off";
};

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  type?: SpinnerType;
  /** Personaliza el texto de accesibilidad sin i18n. */
  labels?: SpinnerLabels;
  /** Ancho del trazo para `type="circle"` (px). */
  strokeWidth?: number;
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

// Estilos por tamaño (coinciden con tu base)
const sizeStyles: Record<SpinnerSize, string> = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

// Colores/variantes (dark-aware)
const variantStyles: Record<SpinnerVariant, string> = {
  primary: "text-blue-600 dark:text-blue-400",
  secondary: "text-gray-600 dark:text-gray-400",
  success: "text-green-600 dark:text-green-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400",
  white: "text-white",
  current: "text-current",
};

// Inyecta keyframes para el modo "bars" (una sola vez)
let injectedBarsKeyframes = false;
function ensureBarsKeyframes() {
  if (injectedBarsKeyframes || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.setAttribute("data-spinner-bars", "true");
  style.textContent = `
@keyframes am-spinner-bars {
  0%, 80%, 100% { transform: scaleY(0.4); opacity: .6; }
  40% { transform: scaleY(1); opacity: 1; }
}`;
  document.head.appendChild(style);
  injectedBarsKeyframes = true;
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      size = "md",
      variant = "primary",
      type = "circle",
      className,
      labels,
      strokeWidth = 3,
      role,
      ...props
    },
    ref
  ) => {
    const safeSize: SpinnerSize = sizeStyles[size] ? size : "md";
    const safeVariant: SpinnerVariant = variantStyles[variant]
      ? variant
      : "primary";

    const L: Required<SpinnerLabels> = {
      label: labels?.label ?? "Loading...",
      live: labels?.live ?? "polite",
    };

    // A11y defaults
    const a11yRole = role ?? "status";
    const ariaLive =
      L.live === "off" ? undefined : (L.live as "polite" | "assertive");

    // ---- Render por tipo ----

    if (type === "dots") {
      return (
        <div
          ref={ref}
          className={cx("inline-flex items-center space-x-1", className)}
          role={a11yRole}
          aria-live={ariaLive}
          aria-label={L.label}
          {...props}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cx(
                sizeStyles[safeSize],
                variantStyles[safeVariant],
                "bg-current rounded-full animate-bounce"
              )}
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: "0.6s",
              }}
              aria-hidden="true"
            />
          ))}
          <span className="sr-only">{L.label}</span>
        </div>
      );
    }

    if (type === "pulse") {
      return (
        <div
          ref={ref}
          className={cx(
            sizeStyles[safeSize],
            variantStyles[safeVariant],
            "inline-block bg-current rounded-full animate-pulse",
            className
          )}
          role={a11yRole}
          aria-live={ariaLive}
          aria-label={L.label}
          style={{
            animationDuration: "1s",
            animationTimingFunction: "ease-in-out",
          }}
          {...props}
        >
          <span className="sr-only">{L.label}</span>
        </div>
      );
    }

    if (type === "bars") {
      ensureBarsKeyframes();
      const barHeight =
        safeSize === "xs"
          ? "h-3"
          : safeSize === "sm"
          ? "h-4"
          : safeSize === "md"
          ? "h-6"
          : safeSize === "lg"
          ? "h-8"
          : "h-12";

      return (
        <div
          ref={ref}
          className={cx("inline-flex items-end space-x-1", className)}
          role={a11yRole}
          aria-live={ariaLive}
          aria-label={L.label}
          {...props}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cx(
                "w-1 rounded-sm",
                barHeight,
                variantStyles[safeVariant],
                "bg-current"
              )}
              style={{
                animation: "am-spinner-bars 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.1}s`,
              }}
              aria-hidden="true"
            />
          ))}
          <span className="sr-only">{L.label}</span>
        </div>
      );
    }

    // circle (default) – visibilidad mejorada (arco grueso + círculo tenue)
    return (
      <div
        ref={ref}
        className={cx("inline-block", sizeStyles[safeSize], className)}
        role={a11yRole}
        aria-live={ariaLive}
        aria-label={L.label}
        {...props}
      >
        <svg
          className="animate-spin w-full h-full"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          {/* fondo muy tenue */}
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth={Math.max(1, strokeWidth - 1)}
            className="opacity-20"
          />
          {/* arco visible */}
          <path
            d="M12 2 A10 10 0 0 1 22 12"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={cx(
              variantStyles[safeVariant],
              "opacity-100 drop-shadow-sm"
            )}
          />
        </svg>
        <span className="sr-only">{L.label}</span>
      </div>
    );
  }
);

Spinner.displayName = "Spinner";

export default Spinner;
