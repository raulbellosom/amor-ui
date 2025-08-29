import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

export type ProgressBarVariant =
  | "brand"
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "gradient"
  | "glass"; // semitransparente

export type ProgressBarSize = "xs" | "sm" | "md" | "lg";
export type ProgressLabelPosition = "none" | "inside" | "outside";

export interface ProgressBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "role"> {
  /** 0..100 (o según min/max) */
  value?: number;
  min?: number;
  max?: number;

  /** Anima como indeterminada (carga sin porcentaje) */
  indeterminate?: boolean;

  /** Buffer opcional (p.ej. streaming): 0..100 */
  buffer?: number;

  /** Aspecto y tamaño */
  variant?: ProgressBarVariant;
  size?: ProgressBarSize;
  rounded?: "none" | "sm" | "md" | "lg" | "full";

  /** Estilo extra */
  striped?: boolean; // franjas
  animated?: boolean; // animación continua de franjas/gradiente
  glow?: boolean; // halo luminoso sutil

  /** Etiqueta */
  showLabel?: boolean; // atajo: true → "inside"
  labelPosition?: ProgressLabelPosition;
  label?: React.ReactNode;
  labelFormatter?: (n: number) => React.ReactNode;

  /** Texto accesible (por defecto: porcentaje) */
  srOnlyLabel?: string;

  className?: string;
}

/* ---------- Utils ---------- */
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
const clamp = (v: number, min: number, max: number) =>
  Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : min;

/* ---------- Componente ---------- */
export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value = 0,
      min = 0,
      max = 100,
      indeterminate = false,
      buffer,

      variant = "brand",
      size = "md",
      rounded = "full",

      striped = true,
      animated = true,
      glow = true,

      showLabel,
      labelPosition = "none",
      label,
      labelFormatter,
      srOnlyLabel,

      className = "",
      ...rest
    },
    ref
  ) => {
    const prefersReduced = useReducedMotion();

    const thickness: Record<ProgressBarSize, string> = {
      xs: "h-1.5",
      sm: "h-2",
      md: "h-3",
      lg: "h-4",
    };

    const radius: Record<NonNullable<ProgressBarProps["rounded"]>, string> = {
      none: "rounded-none",
      sm: "rounded",
      md: "rounded-md",
      lg: "rounded-lg",
      full: "rounded-full",
    };

    // Track base y color de la "fill" según variante (tokens)
    const trackBase =
      "relative w-full overflow-hidden bg-muted/60 border border-border";
    const paletteFill: Record<
      Exclude<ProgressBarVariant, "gradient" | "glass">,
      string
    > = {
      brand: "bg-brand-600 dark:bg-brand-500",
      neutral: "bg-foreground/80 dark:bg-foreground/80",
      success: "bg-green-600 dark:bg-green-500",
      warning: "bg-amber-500 dark:bg-amber-500",
      danger: "bg-red-600 dark:bg-red-500",
      info: "bg-sky-600 dark:bg-sky-500",
    };

    const fillBase = (v: ProgressBarVariant) => {
      if (v === "gradient")
        return "bg-gradient-to-r from-brand-500 via-sky-500 to-violet-500";
      if (v === "glass")
        return "backdrop-blur bg-background/60 border border-border/40";
      return paletteFill[v] ?? paletteFill.brand;
    };

    // Cálculo porcentual seguro
    const safeMin = Math.min(min, max);
    const safeMax = Math.max(min, max);
    const span = Math.max(1, safeMax - safeMin);
    const pVal = clamp(((value - safeMin) / span) * 100, 0, 100);
    const pBuf =
      buffer != null
        ? clamp(((buffer - safeMin) / span) * 100, 0, 100)
        : undefined;

    const showLblInside = showLabel ? "inside" : labelPosition;
    const formatLabel = (): React.ReactNode => {
      if (typeof label !== "undefined") return label;
      if (labelFormatter) return labelFormatter(pVal);
      return `${Math.round(pVal)}%`;
    };

    // Estilos de franjas (CSS inline para no depender del tailwind.config)
    const stripeStyle: React.CSSProperties = striped
      ? {
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,.25) 0 10px, transparent 10px 20px)",
          backgroundSize: "1.25rem 1.25rem",
        }
      : {};

    // Animación de franjas/gradiente (scroll de background)
    const stripeAnim =
      animated && !prefersReduced
        ? {
            backgroundPositionX: [0, 20],
            transition: {
              duration: 0.8,
              ease: "linear",
              repeat: Infinity,
            } as any,
          }
        : undefined;

    // Animación determinate (ancho → valor)
    const widthAnim =
      indeterminate || prefersReduced
        ? undefined
        : {
            width: `${pVal}%`,
            transition: { type: "spring", stiffness: 140, damping: 22 },
          };

    // Indeterminate: barra “corriendo” (30–40% del ancho)
    const indetAnim =
      indeterminate && !prefersReduced
        ? {
            initial: { x: "-30%", width: "30%" },
            animate: { x: "130%" },
            transition: {
              duration: 1.4,
              ease: "linear",
              repeat: Infinity,
            } as any,
          }
        : undefined;

    // Glow sutil (cambia con color)
    const glowClass =
      glow && variant !== "glass" ? "shadow-[0_0_12px_var(--glow)]" : "";

    // Variable CSS para glow según color
    const glowVar: React.CSSProperties =
      variant === "brand"
        ? ({ ["--glow" as any]: "rgba(59,130,246,.45)" } as React.CSSProperties)
        : variant === "success"
        ? ({ ["--glow" as any]: "rgba(22,163,74,.45)" } as React.CSSProperties)
        : variant === "warning"
        ? ({ ["--glow" as any]: "rgba(245,158,11,.45)" } as React.CSSProperties)
        : variant === "danger"
        ? ({ ["--glow" as any]: "rgba(239,68,68,.45)" } as React.CSSProperties)
        : variant === "info"
        ? ({ ["--glow" as any]: "rgba(2,132,199,.45)" } as React.CSSProperties)
        : variant === "neutral"
        ? ({
            ["--glow" as any]: "rgba(120,120,120,.35)",
          } as React.CSSProperties)
        : variant === "gradient"
        ? ({ ["--glow" as any]: "rgba(99,102,241,.45)" } as React.CSSProperties)
        : {};

    // ARIA
    const ariaNow = indeterminate ? undefined : Math.round(pVal);
    const ariaText =
      srOnlyLabel ??
      (indeterminate ? "Cargando…" : `Progreso: ${Math.round(pVal)}%`);

    return (
      <div
        className={cx("w-full flex flex-col gap-1", className)}
        ref={ref}
        {...rest}
      >
        {/* Etiqueta arriba (outside) */}
        {showLblInside === "outside" && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatLabel()}</span>
            {!indeterminate && <span>{Math.round(pVal)}%</span>}
          </div>
        )}

        {/* Track */}
        <div
          className={cx(
            trackBase,
            thickness[size],
            radius[rounded],
            variant === "glass" ? "backdrop-blur" : ""
          )}
          role="progressbar"
          aria-valuemin={indeterminate ? undefined : safeMin}
          aria-valuemax={indeterminate ? undefined : safeMax}
          aria-valuenow={ariaNow}
          aria-label={ariaText}
          style={glowVar}
        >
          {/* Buffer */}
          {typeof pBuf === "number" && !indeterminate && (
            <motion.div
              aria-hidden
              className={cx(
                "absolute inset-y-0 left-0",
                radius[rounded],
                "bg-muted"
              )}
              style={{ width: `${pBuf}%` }}
              transition={{ type: "tween", duration: 0.3 }}
            />
          )}

          {/* Fill */}
          {indeterminate ? (
            <motion.div
              aria-hidden
              className={cx(
                "absolute inset-y-0 left-0",
                radius[rounded],
                fillBase(variant),
                striped && variant !== "glass" && "opacity-95",
                glowClass
              )}
              style={stripeStyle}
              {...(indetAnim as any)}
              {...(stripeAnim as any)}
            />
          ) : (
            <motion.div
              aria-hidden
              className={cx(
                "relative h-full",
                radius[rounded],
                fillBase(variant),
                striped && variant !== "glass" && "opacity-95",
                glowClass
              )}
              style={stripeStyle}
              animate={widthAnim}
              {...(stripeAnim as any)}
            >
              {/* Label inside */}
              {showLblInside === "inside" && (
                <span className="absolute inset-0 grid place-items-center text-[11px] font-medium text-white/95">
                  {formatLabel()}
                </span>
              )}
            </motion.div>
          )}

          {/* Overlay suave (glass/gradient) */}
          {variant === "glass" && (
            <div
              className="pointer-events-none absolute inset-0 bg-white/5 dark:bg-black/10"
              aria-hidden
            />
          )}
          {variant === "gradient" && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 mix-blend-soft-light"
              animate={
                animated && !prefersReduced
                  ? { opacity: [0.1, 0.3, 0.1] }
                  : { opacity: 0.15 }
              }
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </div>

        {/* Etiqueta sr-only si no se muestra */}
        {showLblInside === "none" && (
          <span className="sr-only">{ariaText}</span>
        )}
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";
export default ProgressBar;
