import * as React from "react";
import {
  motion,
  AnimatePresence,
  type HTMLMotionProps,
  type MotionStyle,
} from "motion/react";

type ClassValue = string | false | null | undefined;
const cx = (...v: ClassValue[]) => v.filter(Boolean).join(" ");

export type BreadcrumbSize = "sm" | "md" | "lg";
export type BreadcrumbVariant =
  | "subtle" // típico breadcrumb tenue
  | "muted" // un poco más de contraste que subtle
  | "brand" // tinte de marca
  | "inverted" // para fondos oscuros o hero
  | "glass" // velo translúcido (usa backdrop-blur)
  | "pill"; // items con pills

export type BreadcrumbItem = {
  label: React.ReactNode;
  href?: string;
  onClick?: (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>
  ) => void;
  icon?: React.ComponentType<
    React.SVGProps<SVGSVGElement> & { className?: string }
  >;
  /** Marca explícitamente como el item actual */
  current?: boolean;
  /** Atributos extra de accesibilidad */
  ariaLabel?: string;
  /** Desactiva interacción */
  disabled?: boolean;
};

export interface BreadcrumbProps
  extends Omit<HTMLMotionProps<"nav">, "children"> {
  items: BreadcrumbItem[];

  /** Separador visual entre items. Por defecto: “›” */
  separator?: React.ReactNode;

  /** Tamaño general (tipografía, paddings) */
  size?: BreadcrumbSize;

  /** Apariencia / tema */
  variant?: BreadcrumbVariant;

  /** Si true, recorta etiquetas largas */
  truncate?: boolean;

  /**
   * Si hay muchos items, colapsa los del medio en un menú (…)
   * @example maxItems=5 => muestra 1º, “…”, penúltimo y último
   */
  maxItems?: number;

  /** Cuántos items mostrar al final cuando colapsa (>=2) */
  tailCount?: number;

  /** Densidad compacta (reduce paddings/espaciados) */
  density?: "comfortable" | "compact";

  /** Alineación del breadcrumb en su contenedor */
  align?: "start" | "center" | "end";

  /** Ocultar el primer separador (cuando envuelves en tarjetas con título previo) */
  hideFirstSeparator?: boolean;

  /** tokens / classes personalizadas */
  className?: string;
}

/* ---------- Tokens visuales ---------- */

const SIZE_CLS: Record<BreadcrumbSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const PILL_SIZE_CLS: Record<BreadcrumbSize, string> = {
  sm: "px-2 py-0.5 rounded-md",
  md: "px-2.5 py-1 rounded-lg",
  lg: "px-3 py-1.5 rounded-xl",
};

const SEPARATOR_GAP: Record<"comfortable" | "compact", string> = {
  comfortable: "gap-2",
  compact: "gap-1.5",
};

const ITEM_GAP: Record<"comfortable" | "compact", string> = {
  comfortable: "gap-1.5",
  compact: "gap-1",
};

const VARIANT_ITEM: Record<BreadcrumbVariant, string> = {
  subtle:
    "text-muted-foreground hover:text-foreground focus:text-foreground focus:outline-none",
  muted:
    "text-foreground/90 hover:text-foreground focus:text-foreground focus:outline-none",
  brand:
    "text-brand-600 hover:text-brand-700 focus:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300",
  inverted:
    "text-white/90 hover:text-white focus:text-white focus:outline-none",
  glass:
    "backdrop-blur bg-white/10 text-foreground hover:bg-white/20 border border-white/20 dark:text-white",
  pill: "bg-muted/60 text-foreground hover:bg-muted/80 dark:bg-white/10 dark:text-white",
};

const VARIANT_CURRENT: Record<BreadcrumbVariant, string> = {
  subtle: "text-foreground",
  muted: "text-foreground",
  brand: "text-brand-700 dark:text-brand-300",
  inverted: "text-white",
  glass: "bg-white/20 border border-white/30",
  pill: "bg-muted text-foreground font-medium",
};

const VARIANT_SEPARATOR: Record<BreadcrumbVariant, string> = {
  subtle: "text-muted-foreground/70",
  muted: "text-foreground/60",
  brand: "text-brand-400 dark:text-brand-600",
  inverted: "text-white/70",
  glass: "text-white/70",
  pill: "text-muted-foreground/80",
};

/* ---------- Helpers ---------- */

function isLink(item: BreadcrumbItem) {
  return !!(item.href || item.onClick);
}

function getDisplayedItems(
  items: BreadcrumbItem[],
  maxItems: number,
  tailCount: number
) {
  if (items.length <= maxItems)
    return {
      head: items,
      middle: [] as BreadcrumbItem[],
      tail: [] as BreadcrumbItem[],
    };

  const head = [items[0]];
  const tail = items.slice(-Math.max(2, tailCount));
  const middle = items.slice(1, items.length - tail.length);
  return { head, middle, tail };
}

/* ---------- Componente ---------- */

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  (
    {
      items,
      separator = "›",
      size = "md",
      variant = "subtle",
      truncate = true,
      maxItems = 5,
      tailCount = 2,
      density = "comfortable",
      align = "start",
      hideFirstSeparator = false,
      className,
      style,
      ...motionProps
    },
    ref
  ) => {
    const [menuOpen, setMenuOpen] = React.useState(false);
    const menuBtnRef = React.useRef<HTMLButtonElement>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);

    // Cerrar el menú al hacer click fuera
    React.useEffect(() => {
      function onDocClick(e: MouseEvent) {
        if (!menuOpen) return;
        if (
          menuRef.current &&
          !menuRef.current.contains(e.target as Node) &&
          menuBtnRef.current &&
          !menuBtnRef.current.contains(e.target as Node)
        ) {
          setMenuOpen(false);
        }
      }
      document.addEventListener("mousedown", onDocClick);
      return () => document.removeEventListener("mousedown", onDocClick);
    }, [menuOpen]);

    // Layout de items (con posible colapso)
    const { head, middle, tail } = React.useMemo(
      () =>
        getDisplayedItems(items, Math.max(3, maxItems), Math.max(2, tailCount)),
      [items, maxItems, tailCount]
    );

    const containerAlign =
      align === "center"
        ? "justify-center"
        : align === "end"
        ? "justify-end"
        : "justify-start";

    const sizeCls = SIZE_CLS[size];
    const separatorGap = SEPARATOR_GAP[density];
    const itemGap = ITEM_GAP[density];

    const currentIndex = React.useMemo(() => {
      const idx = items.findIndex((i) => i.current);
      if (idx >= 0) return idx;
      return items.length - 1; // por defecto último es current
    }, [items]);

    const isCurrent = (idx: number) => idx === currentIndex;

    const pillSizing = variant === "pill" ? PILL_SIZE_CLS[size] : "";

    const itemBase =
      "inline-flex items-center " +
      (variant === "pill" ? pillSizing : "") +
      (variant === "glass" ? " rounded-lg px-2 py-1 " : "");

    const itemInteractive =
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md transition-colors";

    const itemVariant = VARIANT_ITEM[variant];
    const itemCurrent = VARIANT_CURRENT[variant];
    const sepVariant = VARIANT_SEPARATOR[variant];

    // A11y: nav + ol/ li + aria-current
    return (
      <motion.nav
        ref={ref}
        aria-label="breadcrumb"
        className={cx("w-full", className)}
        style={style as MotionStyle}
        {...motionProps}
      >
        <ol
          className={cx(
            "flex flex-wrap items-center",
            containerAlign,
            sizeCls,
            separatorGap
          )}
        >
          {/* HEAD */}
          {head.map((item, idx) => {
            const realIndex = idx; // en la lista original es 0
            const content = (
              <ItemContent
                item={item}
                isCurrent={isCurrent(realIndex)}
                variant={variant}
                itemBase={itemBase}
                itemInteractive={itemInteractive}
                itemVariant={itemVariant}
                itemCurrent={itemCurrent}
                truncate={truncate}
                size={size}
                density={density}
              />
            );

            return (
              <li
                key={`head-${idx}`}
                className={cx("flex items-center", itemGap)}
              >
                {!hideFirstSeparator ? (
                  <Separator
                    sep={separator}
                    className={cx(idx === 0 && "hidden", sepVariant)}
                  />
                ) : null}
                {content}
              </li>
            );
          })}

          {/* MIDDLE COLLAPSED */}
          {middle.length > 0 && (
            <li className={cx("relative flex items-center", itemGap)}>
              <Separator sep={separator} className={sepVariant} />
              <button
                type="button"
                ref={menuBtnRef}
                className={cx(
                  itemBase,
                  itemInteractive,
                  variant === "pill" ? "hover:bg-muted/80" : "",
                  variant === "glass" ? "hover:bg-white/20" : "",
                  "text-muted-foreground px-2 py-1"
                )}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Mostrar rutas intermedias"
                onClick={() => setMenuOpen((v) => !v)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setMenuOpen(false);
                }}
              >
                …
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    ref={menuRef}
                    role="menu"
                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className={cx(
                      "absolute z-50 mt-2 min-w-[12rem] rounded-xl border border-border bg-surface shadow-xl",
                      "p-1"
                    )}
                  >
                    {middle.map((m, i) => {
                      const disabled = !!m.disabled;
                      const Comp = m.href ? "a" : "button";
                      const commonCls = cx(
                        "w-full text-left px-3 py-2 rounded-lg",
                        disabled
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-muted/60",
                        "text-sm"
                      );
                      return (
                        <div role="none" key={`mid-${i}`}>
                          <Comp
                            role="menuitem"
                            className={commonCls}
                            href={m.href}
                            onClick={(e: any) => {
                              if (disabled) {
                                e.preventDefault();
                                return;
                              }
                              m.onClick?.(e);
                              setMenuOpen(false);
                            }}
                            aria-label={m.ariaLabel}
                          >
                            <InlineLabel item={m} truncate={truncate} />
                          </Comp>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          )}

          {/* TAIL */}
          {tail.map((item, i) => {
            // índice real: (items.length - tail.length + i)
            const realIndex = items.length - tail.length + i;
            return (
              <li
                key={`tail-${i}`}
                className={cx("flex items-center", itemGap)}
              >
                <Separator sep={separator} className={sepVariant} />
                <ItemContent
                  item={item}
                  isCurrent={isCurrent(realIndex)}
                  variant={variant}
                  itemBase={itemBase}
                  itemInteractive={itemInteractive}
                  itemVariant={itemVariant}
                  itemCurrent={itemCurrent}
                  truncate={truncate}
                  size={size}
                  density={density}
                />
              </li>
            );
          })}

          {/* Caso simple: si no colapsó, pintar el resto (cuando items.length <= maxItems) */}
          {middle.length === 0 && head.length > 0 && items.length > 1 && (
            <>
              {items.slice(1).map((item, idx) => {
                const realIndex = idx + 1;
                return (
                  <li
                    key={`plain-${idx}`}
                    className={cx("flex items-center", itemGap)}
                  >
                    <Separator sep={separator} className={sepVariant} />
                    <ItemContent
                      item={item}
                      isCurrent={isCurrent(realIndex)}
                      variant={variant}
                      itemBase={itemBase}
                      itemInteractive={itemInteractive}
                      itemVariant={itemVariant}
                      itemCurrent={itemCurrent}
                      truncate={truncate}
                      size={size}
                      density={density}
                    />
                  </li>
                );
              })}
            </>
          )}
        </ol>
      </motion.nav>
    );
  }
);

Breadcrumb.displayName = "Breadcrumb";

/* ---------- Subcomponentes ---------- */

function Separator({
  sep,
  className,
}: {
  sep: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cx("select-none", className)} aria-hidden="true">
      {sep}
    </span>
  );
}

function InlineLabel({
  item,
  truncate,
}: {
  item: BreadcrumbItem;
  truncate: boolean;
}) {
  const Icon = item.icon;
  return (
    <span className="inline-flex items-center gap-1.5 min-w-0">
      {Icon ? <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden /> : null}
      <span className={cx("min-w-0", truncate && "truncate")}>
        {item.label}
      </span>
    </span>
  );
}

function ItemContent({
  item,
  isCurrent,
  variant,
  itemBase,
  itemInteractive,
  itemVariant,
  itemCurrent,
  truncate,
  size,
  density,
}: {
  item: BreadcrumbItem;
  isCurrent: boolean;
  variant: BreadcrumbVariant;
  itemBase: string;
  itemInteractive: string;
  itemVariant: string;
  itemCurrent: string;
  truncate: boolean;
  size: BreadcrumbSize;
  density: "comfortable" | "compact";
}) {
  const disabled = !!item.disabled;
  const iconOnly = false;

  const baseClasses = cx(
    itemBase,
    isCurrent ? itemCurrent : itemVariant,
    "transition-colors"
  );

  const interactive = cx(
    itemInteractive,
    !disabled && isLink(item) && "hover:underline"
  );

  const content = <InlineLabel item={item} truncate={truncate} />;

  if (isCurrent || !isLink(item) || disabled) {
    return (
      <span
        className={cx(
          baseClasses,
          "aria-[current=page]:font-medium",
          iconOnly && "p-1"
        )}
        aria-current={isCurrent ? "page" : undefined}
        aria-disabled={disabled || undefined}
      >
        {content}
      </span>
    );
  }

  if (item.href) {
    return (
      <a
        className={cx(baseClasses, interactive)}
        href={item.href}
        onClick={item.onClick as any}
        aria-label={item.ariaLabel}
      >
        {content}
      </a>
    );
  }

  // onClick sin href
  return (
    <button
      type="button"
      className={cx(baseClasses, interactive)}
      onClick={item.onClick}
      aria-label={item.ariaLabel}
    >
      {content}
    </button>
  );
}

export default Breadcrumb;
