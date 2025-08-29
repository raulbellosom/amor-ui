// Skeleton.tsx
import * as React from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type HTMLMotionProps,
  type MotionStyle,
} from "motion/react";

type ClassValue = string | false | null | undefined;
const cx = (...v: ClassValue[]) => v.filter(Boolean).join(" ");

export type SkeletonVariant =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "glass"
  | "gradient";

export type SkeletonAnimation = "shimmer" | "pulse" | "wave" | "none";
export type SkeletonShape =
  | "rect"
  | "circle"
  | "pill"
  | "text"
  | "avatar"
  | "thumbnail"
  | "title"
  | "button"
  | "input";

export type SkeletonSize = "xs" | "sm" | "md" | "lg" | "xl";
export type SkeletonRadius = "none" | "sm" | "md" | "lg" | "xl" | "full";

/**
 * Importante:
 * - Extendemos HTMLMotionProps<"div"> (y omitimos children) para compatibilidad total con Motion.
 * - Renderizamos SIEMPRE con <motion.div> para no mezclar tipos nativos vs Motion.
 */
export interface SkeletonProps
  extends Omit<HTMLMotionProps<"div">, "children"> {
  loading?: boolean;

  // Apariencia
  variant?: SkeletonVariant;
  animation?: SkeletonAnimation;

  // Geometría
  shape?: SkeletonShape;
  size?: SkeletonSize;
  radius?: SkeletonRadius;

  // Medidas explícitas
  width?: number | string;
  height?: number | string;

  // Para shape="text"
  lines?: number;
  lineGap?: number | string;

  // Dirección del shimmer/wave
  direction?: "ltr" | "rtl";

  // Accesibilidad
  ariaLabel?: string;

  // Contenido real (se muestra cuando loading=false)
  children?: React.ReactNode;
}

/* ---- Tokens de tamaño ---- */
const THICKNESS: Record<SkeletonSize, string> = {
  xs: "h-2",
  sm: "h-3",
  md: "h-4",
  lg: "h-5",
  xl: "h-6",
};

const RADIUS: Record<SkeletonRadius, string> = {
  none: "rounded-none",
  sm: "rounded",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

/* ---- Paletas por variante ---- */
const BASE_TRACK = "relative overflow-hidden bg-muted/60";
const PALETTES: Record<
  Exclude<SkeletonVariant, "glass" | "gradient">,
  string
> = {
  neutral: "bg-muted/60",
  brand: "bg-brand-200 dark:bg-brand-900/20",
  success: "bg-green-200 dark:bg-green-900/20",
  warning: "bg-amber-200 dark:bg-amber-900/20",
  danger: "bg-red-200 dark:bg-red-900/20",
  info: "bg-sky-200 dark:bg-sky-900/20",
};

const FILL_FOR_GRADIENT =
  "bg-gradient-to-r from-brand-200/70 via-sky-200/70 to-violet-200/70 dark:from-brand-900/30 dark:via-sky-900/30 dark:to-violet-900/30";

/* ---- Utilidades ---- */
const autoWidths = (n: number) =>
  Array.from({ length: n }).map((_, i) =>
    i === n - 1 ? `${70 + Math.round(Math.random() * 20)}%` : "100%"
  );

/* ---- Componente ---- */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      loading = true,
      variant = "neutral",
      animation = "shimmer",
      shape = "rect",
      size = "md",
      radius = "lg",
      width,
      height,
      lines = 3,
      lineGap = "0.5rem",
      direction = "ltr",
      ariaLabel = "Cargando",
      className,
      style,
      children,
      ...motionProps // 👈 cualquier prop de Motion (drag, animate, etc.) es válida
    },
    ref
  ) => {
    const prefersReduced = useReducedMotion();

    /* ---- Resolver clase base por variante ---- */
    const baseColor =
      variant === "glass"
        ? "backdrop-blur bg-background/50 border border-border/40"
        : variant === "gradient"
        ? FILL_FOR_GRADIENT
        : PALETTES[variant];

    /* ---- Resolver geometría por shape ---- */
    const geom = (() => {
      if (shape === "text") return `${THICKNESS.xs}`;
      if (shape === "title") return "h-5 md:h-6";
      if (shape === "button") return THICKNESS.md;
      if (shape === "input") return "h-10";
      if (shape === "avatar") return "w-10 h-10 md:w-12 md:h-12 rounded-full";
      if (shape === "thumbnail") return "w-full aspect-video";
      if (shape === "circle")
        return `${THICKNESS[size]} aspect-square rounded-full`;
      if (shape === "pill") return `${THICKNESS[size]} ${RADIUS.full}`;
      return `${THICKNESS[size]}`;
    })();

    // Radius final (si el shape forzó uno)
    const radiusClass =
      shape === "avatar" || shape === "circle"
        ? "rounded-full"
        : shape === "pill"
        ? "rounded-full"
        : RADIUS[radius];

    /* ---- Animaciones ---- */
    const SHIMMER_GRADIENT_LIGHT = "from-white/30 via-white/55 to-white/30";
    const SHIMMER_GRADIENT_DARK =
      "dark:from-white/5 dark:via-white/12 dark:to-white/5";

    const shimmerEl = (
      <motion.div
        aria-hidden
        className={cx(
          "pointer-events-none absolute inset-y-0 -left-1/3 w-1/3",
          "bg-gradient-to-r",
          SHIMMER_GRADIENT_LIGHT,
          SHIMMER_GRADIENT_DARK,
          "mix-blend-overlay"
        )}
        initial={{ x: direction === "rtl" ? "130%" : "-30%" }}
        animate={
          !prefersReduced && animation === "shimmer"
            ? { x: direction === "rtl" ? "-30%" : "130%" }
            : undefined
        }
        transition={{ duration: 1.35, ease: "linear", repeat: Infinity }}
      />
    );

    const waveEl = (
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 12px, transparent 12px 24px)",
        }}
        animate={
          !prefersReduced && animation === "wave"
            ? { backgroundPositionX: direction === "rtl" ? [0, -32] : [0, 32] }
            : undefined
        }
        transition={{ duration: 0.8, ease: "linear", repeat: Infinity }}
      />
    );

    const pulseAnim =
      !prefersReduced && animation === "pulse"
        ? { opacity: [0.85, 1, 0.85] }
        : undefined;

    const rootStyle: MotionStyle = {
      ...(style as MotionStyle),
      ...(width
        ? { width: typeof width === "number" ? `${width}px` : width }
        : {}),
      ...(height
        ? { height: typeof height === "number" ? `${height}px` : height }
        : {}),
    };

    /* ---- Render principal ---- */
    if (!loading) {
      // Fade-in para el contenido real al terminar de cargar
      return (
        <AnimatePresence mode="wait">
          <motion.div
            key="content"
            ref={ref}
            initial={{ opacity: 0.0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0.0, y: -2 }}
            transition={{ duration: 0.2 }}
            {...motionProps}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      );
    }

    // Skeleton "single" (no text multilínea)
    if (shape !== "text") {
      return (
        <motion.div
          ref={ref}
          role="status"
          aria-label={ariaLabel}
          aria-live="polite"
          className={cx(BASE_TRACK, baseColor, geom, radiusClass, className)}
          style={rootStyle}
          {...motionProps}
        >
          {/* capa para pulse */}
          <motion.div
            aria-hidden
            className="absolute inset-0"
            animate={pulseAnim}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          {/* overlay shimmer / wave */}
          {animation === "shimmer" && shimmerEl}
          {animation === "wave" && waveEl}
          {/* glass extra velo si aplica */}
          {variant === "glass" && (
            <div
              className="pointer-events-none absolute inset-0 bg-white/5 dark:bg-black/10"
              aria-hidden
            />
          )}
          <span className="sr-only">{ariaLabel}</span>
        </motion.div>
      );
    }

    // Skeleton "text" multilínea
    const widths = autoWidths(lines);
    return (
      <motion.div
        ref={ref}
        role="status"
        aria-label={ariaLabel}
        aria-live="polite"
        className={cx("w-full space-y-2", className)}
        style={
          {
            ...rootStyle,
            rowGap:
              typeof lineGap === "number"
                ? `${lineGap}px`
                : (lineGap as string),
          } as MotionStyle
        }
        {...motionProps}
      >
        {widths.map((w, i) => (
          <div
            key={i}
            className={cx(
              BASE_TRACK,
              baseColor,
              THICKNESS.xs,
              radiusClass,
              "w-full"
            )}
            style={{ width: w }}
          >
            <motion.div
              aria-hidden
              className="absolute inset-0"
              animate={pulseAnim}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            {animation === "shimmer" && shimmerEl}
            {animation === "wave" && waveEl}
            {variant === "glass" && (
              <div
                className="pointer-events-none absolute inset-0 bg-white/5 dark:bg-black/10"
                aria-hidden
              />
            )}
          </div>
        ))}
        <span className="sr-only">{ariaLabel}</span>
      </motion.div>
    );
  }
);

Skeleton.displayName = "Skeleton";
export default Skeleton;
