import * as React from "react";
import { motion, AnimatePresence } from "motion/react";

export type TooltipVariant =
  | "brand"
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "glass";
export type TooltipSize = "sm" | "md" | "lg";
export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  children: React.ReactElement | React.ReactNode;
  content: React.ReactNode;

  /** Apariencia */
  variant?: TooltipVariant;
  size?: TooltipSize;
  placement?: TooltipPlacement;
  className?: string; // clase extra sobre el panel
  arrow?: boolean; // muestra la flecha
  offset?: number; // px de separación con el trigger

  /** Comportamiento */
  trigger?: "hover" | "focus" | "click" | "manual";
  open?: boolean; // modo controlado si trigger="manual" (o para click/hover controlado)
  defaultOpen?: boolean; // modo no controlado
  onOpenChange?: (next: boolean) => void;
  disabled?: boolean;
  delayOpen?: number; // ms
  delayClose?: number; // ms

  /** Layout/portales */
  portal?: boolean; // si más adelante quieres montar en body (no implementado aquí)
  asChild?: boolean; // clona el hijo en lugar de envolverlo

  /** Accesibilidad */
  id?: string; // id del tooltip (para aria-describedby)
  "aria-label"?: string; // si quieres forzar label en vez de describedby
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const VARIANTS: Record<TooltipVariant, string> = {
  brand: "bg-brand-700 text-white dark:bg-brand-600",
  neutral: "bg-foreground text-background",
  success: "bg-green-600 text-white",
  warning: "bg-amber-500 text-black",
  danger: "bg-red-600 text-white",
  info: "bg-sky-600 text-white",
  glass:
    "backdrop-blur bg-background/70 text-foreground border border-border/40",
};

const SIZES: Record<
  TooltipSize,
  { pad: string; text: string; radius: string; arrow: number }
> = {
  sm: { pad: "px-2 py-1", text: "text-[11px]", radius: "rounded-md", arrow: 6 },
  md: { pad: "px-2.5 py-1.5", text: "text-xs", radius: "rounded-lg", arrow: 7 },
  lg: { pad: "px-3 py-2", text: "text-sm", radius: "rounded-xl", arrow: 8 },
};

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  (props, ref) => {
    const {
      children,
      content,
      variant = "neutral",
      size = "md",
      placement = "top",
      className,
      arrow = true,
      offset = 8,

      trigger = "hover",
      open,
      defaultOpen = false,
      onOpenChange,
      disabled = false,
      delayOpen = 80,
      delayClose = 80,

      portal = false,
      asChild = true,

      id,
      "aria-label": ariaLabel,
    } = props;

    const triggerRef = React.useRef<HTMLElement | null>(null);
    const panelRef = React.useRef<HTMLDivElement | null>(null);
    const arrowSize = SIZES[size].arrow;

    const [uncontrolled, setUncontrolled] = React.useState(defaultOpen);
    const isControlled = open !== undefined;
    const isOpen = isControlled ? !!open : uncontrolled;

    // ids accesibles
    const autoId = React.useId();
    const tooltipId = id ?? `tt-${autoId}`;

    // timers para delay
    const openTimer = React.useRef<number | null>(null);
    const closeTimer = React.useRef<number | null>(null);
    const clearTimers = () => {
      if (openTimer.current) {
        window.clearTimeout(openTimer.current);
        openTimer.current = null;
      }
      if (closeTimer.current) {
        window.clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
    };

    const setOpen = (next: boolean) => {
      if (disabled) return;
      if (isControlled) onOpenChange?.(next);
      else {
        setUncontrolled(next);
        onOpenChange?.(next);
      }
    };

    // posición (simple pero robusta con absolute dentro del wrapper)
    const [style, setStyle] = React.useState<React.CSSProperties>({});
    const updatePosition = React.useCallback(() => {
      const t = triggerRef.current;
      const p = panelRef.current;
      if (!t || !p) return;
      const tr = t.getBoundingClientRect();
      const pw = p.offsetWidth;
      const ph = p.offsetHeight;

      let top = 0,
        left = 0;
      if (placement === "top") {
        top = tr.top + window.scrollY - ph - offset;
        left = tr.left + window.scrollX + tr.width / 2 - pw / 2;
      } else if (placement === "bottom") {
        top = tr.bottom + window.scrollY + offset;
        left = tr.left + window.scrollX + tr.width / 2 - pw / 2;
      } else if (placement === "left") {
        top = tr.top + window.scrollY + tr.height / 2 - ph / 2;
        left = tr.left + window.scrollX - pw - offset;
      } else {
        // right
        top = tr.top + window.scrollY + tr.height / 2 - ph / 2;
        left = tr.right + window.scrollX + offset;
      }
      setStyle({
        position: "absolute",
        top,
        left,
        zIndex: 60,
        pointerEvents: "none",
      });
    }, [placement, offset]);

    React.useEffect(() => {
      if (!isOpen) return;
      updatePosition();
      const ro = new ResizeObserver(updatePosition);
      if (triggerRef.current) ro.observe(triggerRef.current);
      if (panelRef.current) ro.observe(panelRef.current);
      const onScroll = () => updatePosition();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      return () => {
        ro.disconnect();
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }, [isOpen, updatePosition]);

    // handlers por modo
    const doOpen = () => {
      clearTimers();
      openTimer.current = window.setTimeout(
        () => setOpen(true),
        delayOpen
      ) as unknown as number;
    };
    const doClose = () => {
      clearTimers();
      closeTimer.current = window.setTimeout(
        () => setOpen(false),
        delayClose
      ) as unknown as number;
    };
    const instantToggle = () => setOpen(!isOpen);

    const triggerProps: any = {};
    if (trigger === "hover") {
      triggerProps.onMouseEnter = doOpen;
      triggerProps.onMouseLeave = doClose;
      triggerProps.onFocus = doOpen;
      triggerProps.onBlur = doClose;
    } else if (trigger === "focus") {
      triggerProps.onFocus = doOpen;
      triggerProps.onBlur = doClose;
    } else if (trigger === "click") {
      triggerProps.onClick = instantToggle;
      triggerProps.onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
    }

    // fusionar ref del trigger
    function setTriggerNode(node: HTMLElement | null) {
      triggerRef.current = node;
      const childRef = (child as any)?.ref;
      if (typeof childRef === "function") childRef(node);
      else if (childRef && typeof childRef === "object")
        (childRef as any).current = node;
    }

    // render del trigger: clonar hijo si asChild y es elemento
    const child = React.isValidElement(children) ? (
      children
    ) : (
      <span>{children}</span>
    );
    const triggerNode =
      asChild && React.isValidElement(children) ? (
        React.cloneElement(children as React.ReactElement, {
          ref: setTriggerNode,
          "aria-describedby": isOpen && !ariaLabel ? tooltipId : undefined,
          "aria-label": ariaLabel,
          "aria-expanded": trigger === "click" ? isOpen : undefined,
          ...triggerProps,
        })
      ) : (
        <span
          ref={setTriggerNode as any}
          className="inline-flex"
          tabIndex={0}
          aria-describedby={isOpen && !ariaLabel ? tooltipId : undefined}
          aria-label={ariaLabel}
          aria-expanded={trigger === "click" ? isOpen : undefined}
          {...triggerProps}
        >
          {child}
        </span>
      );

    const palette = VARIANTS[variant];
    const SZ = SIZES[size];
    const panelCls = cx(
      "pointer-events-none select-none shadow-xl",
      palette,
      SZ.pad,
      SZ.text,
      SZ.radius,
      variant === "glass" ? "" : "border border-black/10 dark:border-white/10",
      className
    );

    // flecha
    const arrowEl = arrow ? (
      <span
        aria-hidden
        className={cx(
          "absolute rotate-45",
          palette,
          variant === "glass"
            ? ""
            : "border border-black/10 dark:border-white/10"
        )}
        style={{
          width: arrowSize,
          height: arrowSize,
          ...(placement === "top"
            ? { bottom: -arrowSize / 2 }
            : placement === "bottom"
            ? { top: -arrowSize / 2 }
            : placement === "left"
            ? { right: -arrowSize / 2 }
            : { left: -arrowSize / 2 }),
        }}
      />
    ) : null;

    return (
      <div ref={ref} className="relative inline-block">
        {triggerNode}

        <AnimatePresence>
          {!disabled && isOpen && (
            <motion.div
              ref={panelRef}
              id={tooltipId}
              role="tooltip"
              initial={{
                opacity: 0,
                y: placement === "top" ? -6 : placement === "bottom" ? 6 : 0,
                x: placement === "left" ? -6 : placement === "right" ? 6 : 0,
                scale: 0.98,
              }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: placement === "top" ? -6 : placement === "bottom" ? 6 : 0,
                x: placement === "left" ? -6 : placement === "right" ? 6 : 0,
                scale: 0.98,
              }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 28,
                mass: 0.6,
              }}
              className={panelCls}
              style={style}
            >
              {content}
              {arrowEl}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Tooltip.displayName = "Tooltip";
export default Tooltip;
