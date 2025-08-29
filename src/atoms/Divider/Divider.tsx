// Divider.tsx
import * as React from "react";
import {
  motion,
  type HTMLMotionProps,
  type MotionStyle,
  useReducedMotion,
} from "motion/react";

type ClassValue = string | false | null | undefined;
const cx = (...v: ClassValue[]) => v.filter(Boolean).join(" ");

export type DividerOrientation = "horizontal" | "vertical";
export type DividerVariant =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "subtle" // muy tenue, para separar bloques
  | "glass" // velo translúcido
  | "gradient"; // gradiente suave
export type DividerStyle = "solid" | "dashed" | "dotted";
export type DividerSize = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Divider con la misma filosofía que tus otros componentes:
 * - Extiende HTMLMotionProps<"div"> para poder aceptar props Motion (animate, whileInView, etc.)
 * - A11y: role="separator", aria-orientation
 * - Temas/variantes, orientación, grosor, estilo, glows y shimmer opcional
 * - Soporta "label" centrado o children renderizados en el centro
 */
export interface DividerProps extends Omit<HTMLMotionProps<"div">, "children"> {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  lineStyle?: DividerStyle; // solid | dashed | dotted
  size?: DividerSize; // grosor
  inset?: boolean; // si true, retrae los extremos respecto al contenedor
  /** Cuando hay contenido, alineación del texto vs líneas */
  align?: "start" | "center" | "end";
  /** Espacio alrededor (clase Tailwind o CSSSize) */
  gap?: number | string;
  /** Longitud explícita de la línea (solo horizontal) */
  length?: number | string;
  /** Alto explícito (solo vertical) */
  height?: number | string;

  /** Contenido central del divider (texto, chips, iconos…) */
  children?: React.ReactNode;
  /** Alternativa a children si prefieres un prop semántico */
  label?: React.ReactNode;

  /** Animaciones */
  animated?: boolean; // shimmer sutil en la línea
  pulse?: boolean; // ligera variación de opacidad
}

const SIZE_TO_THICKNESS: Record<DividerSize, string> = {
  xs: "h-px",
  sm: "h-[2px]",
  md: "h-[3px]",
  lg: "h-1",
  xl: "h-[6px]",
};

const SIZE_TO_THICKNESS_V: Record<DividerSize, string> = {
  xs: "w-px",
  sm: "w-[2px]",
  md: "w-[3px]",
  lg: "w-1",
  xl: "w-[6px]",
};

const VARIANTS: Record<
  Exclude<DividerVariant, "glass" | "gradient" | "subtle">,
  string
> = {
  neutral: "bg-muted/60",
  brand: "bg-brand-400/80 dark:bg-brand-500/70",
  success: "bg-green-500/80 dark:bg-green-500/70",
  warning: "bg-amber-500/80 dark:bg-amber-500/70",
  danger: "bg-red-500/80 dark:bg-red-500/70",
  info: "bg-sky-500/80 dark:bg-sky-500/70",
};

const SUBTLE = "bg-border/70 dark:bg-white/10";
const GLASS =
  "backdrop-blur bg-white/20 dark:bg-white/10 border border-white/20 dark:border-white/10";
const GRADIENT =
  "bg-gradient-to-r from-brand-200/70 via-sky-200/70 to-violet-200/70 " +
  "dark:from-brand-900/30 dark:via-sky-900/30 dark:to-violet-900/30";

const LINE_STYLE_CLASS: Record<DividerStyle, string> = {
  solid: "border-none",
  dashed: "border-none bg-[length:12px_100%] bg-repeat-x",
  dotted: "border-none bg-[length:6px_100%] bg-repeat-x",
};

const LINE_STYLE_CLASS_V: Record<DividerStyle, string> = {
  solid: "border-none",
  dashed: "border-none bg-[length:100%_12px] bg-repeat-y",
  dotted: "border-none bg-[length:100%_6px] bg-repeat-y",
};

function resolveBg(
  variant: DividerVariant,
  lineStyle: DividerStyle,
  vertical: boolean
) {
  // Para dashed/dotted, usamos background-image con gradients para “segmentar”
  const base =
    variant === "glass"
      ? "bg-white/30 dark:bg-white/20"
      : variant === "gradient"
      ? GRADIENT
      : variant === "subtle"
      ? SUBTLE
      : VARIANTS[variant];

  if (lineStyle === "solid") return base;

  const pattern =
    lineStyle === "dashed"
      ? "linear-gradient(currentColor,currentColor)"
      : "radial-gradient(currentColor 1px,transparent 1px)";

  if (variant === "gradient" || variant === "glass") {
    // para gradient/glass, aplicamos color de texto para “currentColor”
    return cx(
      base,
      "text-white/70 dark:text-white/50", // currentColor base
      vertical ? LINE_STYLE_CLASS_V[lineStyle] : LINE_STYLE_CLASS[lineStyle],
      vertical
        ? "bg-[image:linear-gradient(currentColor,currentColor)]"
        : "bg-[image:linear-gradient(currentColor,currentColor)]"
    );
  }

  return cx(
    base,
    "text-current",
    vertical ? LINE_STYLE_CLASS_V[lineStyle] : LINE_STYLE_CLASS[lineStyle],
    vertical
      ? "bg-[image:linear-gradient(currentColor,currentColor)]"
      : "bg-[image:linear-gradient(currentColor,currentColor)]"
  );
}

export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      orientation = "horizontal",
      variant = "subtle",
      lineStyle = "solid",
      size = "sm",
      inset = false,
      align = "center",
      gap = "0.75rem",
      length,
      height,
      children,
      label,
      animated = false,
      pulse = false,
      className,
      style,
      ...motionProps
    },
    ref
  ) => {
    const prefersReduced = useReducedMotion();
    const hasContent = !!(children ?? label);
    const vertical = orientation === "vertical";

    // container styles
    const container = cx(
      vertical
        ? "flex flex-col items-center justify-center"
        : "w-full flex items-center",
      inset && !vertical && "px-2 md:px-3",
      className
    );

    // line styles
    const thickness = vertical
      ? SIZE_TO_THICKNESS_V[size] ?? SIZE_TO_THICKNESS_V.sm
      : SIZE_TO_THICKNESS[size] ?? SIZE_TO_THICKNESS.sm;

    const colorBg = resolveBg(variant, lineStyle, vertical);

    // longitudes explícitas
    const lineStyleInline: MotionStyle = vertical
      ? {
          height:
            height !== undefined
              ? typeof height === "number"
                ? `${height}px`
                : (height as string)
              : "100%",
        }
      : {
          width:
            length !== undefined
              ? typeof length === "number"
                ? `${length}px`
                : (length as string)
              : "100%",
        };

    // shimmer opcional
    const shimmer = animated && !prefersReduced && lineStyle === "solid";

    const shimmerOverlay = shimmer ? (
      <motion.div
        aria-hidden
        className={cx(
          "pointer-events-none absolute inset-0",
          !vertical && "bg-gradient-to-r from-white/0 via-white/30 to-white/0",
          vertical && "bg-gradient-to-b from-white/0 via-white/30 to-white/0",
          "mix-blend-overlay"
        )}
        initial={{ x: vertical ? 0 : "-30%", y: vertical ? "-30%" : 0 }}
        animate={vertical ? { y: ["-30%", "130%"] } : { x: ["-30%", "130%"] }}
        transition={{ duration: 1.35, ease: "linear", repeat: Infinity }}
      />
    ) : null;

    const lineBase = cx(
      "relative overflow-hidden shrink-0",
      colorBg,
      thickness,
      // para dashed/dotted (usando bg-image), damos el color
      (lineStyle === "dashed" || lineStyle === "dotted") &&
        "text-border/60 dark:text-white/10",
      variant === "glass" && "rounded-full " + GLASS
    );

    const sideGap: MotionStyle = {
      marginLeft:
        align === "end"
          ? typeof gap === "number"
            ? `${gap}px`
            : (gap as string)
          : undefined,
      marginRight:
        align === "start"
          ? typeof gap === "number"
            ? `${gap}px`
            : (gap as string)
          : undefined,
    };

    const pulseAnim =
      pulse && !prefersReduced ? { opacity: [0.8, 1, 0.8] } : undefined;

    // Render sin contenido: una sola línea
    if (!hasContent) {
      return (
        <motion.div
          ref={ref}
          role="separator"
          aria-orientation={vertical ? "vertical" : "horizontal"}
          className={container}
          style={style as MotionStyle}
          {...motionProps}
        >
          <motion.div
            className={lineBase}
            style={lineStyleInline}
            animate={pulseAnim}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            {shimmerOverlay}
          </motion.div>
        </motion.div>
      );
    }

    // Con contenido centrado (label/children)
    const content = children ?? label;

    const leftFlex =
      align === "start"
        ? "w-4 shrink-0"
        : align === "end"
        ? "flex-1"
        : "flex-1";
    const rightFlex =
      align === "start"
        ? "flex-1"
        : align === "end"
        ? "w-4 shrink-0"
        : "flex-1";

    if (!vertical) {
      const gapVal = typeof gap === "number" ? `${gap}px` : (gap as string);
      return (
        <motion.div
          ref={ref}
          role="separator"
          aria-orientation="horizontal"
          className={cx(container, "gap-2")}
          style={style as MotionStyle}
          {...motionProps}
        >
          <motion.div
            className={cx(lineBase, leftFlex)}
            style={{ ...lineStyleInline, marginRight: gapVal, ...sideGap }}
            animate={pulseAnim}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            {shimmerOverlay}
          </motion.div>

          <div className="shrink-0">
            {/* slot central: texto, chip, iconos, etc. */}
            {typeof content === "string" ? (
              <span className="text-xs font-medium text-muted-foreground">
                {content}
              </span>
            ) : (
              content
            )}
          </div>

          <motion.div
            className={cx(lineBase, rightFlex)}
            style={{ ...lineStyleInline, marginLeft: gapVal, ...sideGap }}
            animate={pulseAnim}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            {shimmerOverlay}
          </motion.div>
        </motion.div>
      );
    }

    // Vertical con contenido (apila arriba-línea, contenido, línea-abajo)
    return (
      <motion.div
        ref={ref}
        role="separator"
        aria-orientation="vertical"
        className={cx(container, "gap-2")}
        style={style as MotionStyle}
        {...motionProps}
      >
        <motion.div
          className={cx(lineBase)}
          style={lineStyleInline}
          animate={pulseAnim}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          {shimmerOverlay}
        </motion.div>

        <div className="shrink-0 rotate-90">
          {typeof content === "string" ? (
            <span className="text-xs font-medium text-muted-foreground">
              {content}
            </span>
          ) : (
            content
          )}
        </div>

        <motion.div
          className={cx(lineBase)}
          style={lineStyleInline}
          animate={pulseAnim}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          {shimmerOverlay}
        </motion.div>
      </motion.div>
    );
  }
);

Divider.displayName = "Divider";
export default Divider;
