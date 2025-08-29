import * as React from "react";
import { motion, type HTMLMotionProps, type MotionStyle } from "motion/react";

type ClassValue = string | false | null | undefined;
const cx = (...v: ClassValue[]) => v.filter(Boolean).join(" ");

/* ===================== Tipos ===================== */

export type PaginationSize = "sm" | "md" | "lg";
export type PaginationVariant =
  | "subtle"
  | "muted"
  | "brand"
  | "inverted"
  | "glass"
  | "pill";

export interface PaginationAriaLabels {
  root?: string; // aria-label del <nav>
  first?: string;
  previous?: string;
  next?: string;
  last?: string;
  page?: (n: number) => string; // etiqueta por página
  pageSize?: string; // label del selector
}

export interface PaginationProps
  extends Omit<HTMLMotionProps<"nav">, "children"> {
  /** Página actual (1-based) */
  page: number;
  /** Tamaño de página actual */
  pageSize: number;
  /** Total de elementos (para calcular total de páginas) */
  total: number;

  /** Callback al cambiar de página */
  onPageChange: (nextPage: number) => void;

  /** Callback al cambiar tamaño de página */
  onPageSizeChange?: (nextSize: number) => void;

  /** Opciones para pageSize (si showPageSize = true) */
  pageSizeOptions?: number[];

  /** Mostrar selector de page size */
  showPageSize?: boolean;

  /** Cuántas páginas mostrar a cada lado de la actual */
  siblingCount?: number; // default 1

  /** Cuántas páginas mostrar al inicio y final */
  boundaryCount?: number; // default 1

  /** Mostrar/ocultar controles */
  showFirstLast?: boolean; // default true
  showPrevNext?: boolean; // default true

  /** Apariencia/tema y tamaño */
  variant?: PaginationVariant;
  size?: PaginationSize;
  density?: "comfortable" | "compact";

  /** Deshabilitar toda la paginación */
  disabled?: boolean;

  /** Truncar números muy largos (clase truncate) */
  truncate?: boolean;

  /** Etiquetas accesibles / i18n */
  ariaLabels?: PaginationAriaLabels;

  /** Mostrar “X–Y de Z” resumen */
  showSummary?: boolean;

  /** Render personalizado del resumen */
  renderSummary?: (from: number, to: number, total: number) => React.ReactNode;

  className?: string;
}

/* ===================== Tokens visuales ===================== */

const SIZE_CLS: Record<PaginationSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const BTN_SIZE_CLS: Record<PaginationSize, string> = {
  sm: "h-8 min-w-8 px-2 rounded-md",
  md: "h-9 min-w-9 px-2.5 rounded-lg",
  lg: "h-10 min-w-10 px-3 rounded-xl",
};

const DENSITY_GAP: Record<"comfortable" | "compact", string> = {
  comfortable: "gap-1.5",
  compact: "gap-1",
};

const VARIANT_BTN: Record<PaginationVariant, string> = {
  subtle:
    "bg-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground",
  muted: "bg-transparent text-foreground hover:bg-muted/70",
  brand:
    "bg-transparent text-brand-600 hover:bg-brand-50 hover:text-brand-700 dark:text-brand-400 dark:hover:bg-brand-950/40",
  inverted: "bg-transparent text-white/90 hover:bg-white/10",
  glass:
    "backdrop-blur bg-white/10 text-foreground hover:bg-white/20 border border-white/20 dark:text-white",
  pill: "bg-muted/60 text-foreground hover:bg-muted",
};

const VARIANT_ACTIVE: Record<PaginationVariant, string> = {
  subtle: "bg-muted text-foreground",
  muted: "bg-foreground text-background",
  brand: "bg-brand-600 text-white dark:bg-brand-500",
  inverted: "bg-white text-gray-900",
  glass: "bg-white/20 border border-white/30",
  pill: "bg-muted text-foreground font-medium",
};

const ICON_CLS: Record<PaginationSize, string> = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

/* ===================== Utils ===================== */

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(n, max));
}

type RangeItem = number | "ellipsis";

function buildRange(
  page: number,
  totalPages: number,
  siblingCount = 1,
  boundaryCount = 1
): RangeItem[] {
  const startPages = range(1, Math.min(boundaryCount, totalPages));
  const endPages = range(
    Math.max(totalPages - boundaryCount + 1, boundaryCount + 1),
    totalPages
  );

  const left = Math.max(page - siblingCount, boundaryCount + 1);
  const right = Math.min(page + siblingCount, totalPages - boundaryCount);

  const middlePages = range(left, right);

  const items: RangeItem[] = [];
  items.push(...startPages);

  if (left > boundaryCount + 1) items.push("ellipsis");
  items.push(...middlePages);
  if (right < totalPages - boundaryCount) items.push("ellipsis");

  // Evitar duplicados con los extremos
  for (const p of endPages) {
    if (!items.includes(p)) items.push(p);
  }

  return items;
}

function range(start: number, end: number): number[] {
  if (end < start) return [];
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/* ===================== Componente ===================== */

export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  (
    {
      page,
      pageSize,
      total,
      onPageChange,
      onPageSizeChange,
      pageSizeOptions = [10, 20, 50],
      showPageSize = false,
      siblingCount = 1,
      boundaryCount = 1,
      showFirstLast = true,
      showPrevNext = true,
      variant = "subtle",
      size = "md",
      density = "comfortable",
      disabled = false,
      truncate = false,
      ariaLabels,
      showSummary = true,
      renderSummary,
      className,
      style,
      ...motionProps
    },
    ref
  ) => {
    const totalPages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
    const safePage = clamp(page, 1, totalPages);

    React.useEffect(() => {
      if (page !== safePage) onPageChange(safePage);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalPages]);

    const goTo = (n: number) => {
      if (disabled) return;
      const next = clamp(n, 1, totalPages);
      if (next !== page) onPageChange(next);
    };

    const next = () => goTo(page + 1);
    const prev = () => goTo(page - 1);
    const first = () => goTo(1);
    const last = () => goTo(totalPages);

    const items = buildRange(page, totalPages, siblingCount, boundaryCount);

    const sizeCls = SIZE_CLS[size];
    const btnCls = BTN_SIZE_CLS[size];
    const gapCls = DENSITY_GAP[density];

    const variantBtn = VARIANT_BTN[variant];
    const activeBtn = VARIANT_ACTIVE[variant];
    const iconCls = ICON_CLS[size];

    const label: PaginationAriaLabels = {
      root: "pagination",
      first: "Primera página",
      previous: "Página anterior",
      next: "Página siguiente",
      last: "Última página",
      page: (n) => `Página ${n}`,
      pageSize: "Elementos por página",
      ...ariaLabels,
    };

    // Cálculo del resumen X–Y de Z
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);

    // Accesibilidad con teclado en el contenedor
    const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
      if (disabled) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Home") first();
      if (e.key === "End") last();
    };

    return (
      <motion.nav
        ref={ref}
        aria-label={label.root}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className={cx("w-full flex flex-col gap-2", className)}
        style={style as MotionStyle}
        {...motionProps}
      >
        {/* Top row: summary + size selector (opcional) */}
        {(showSummary || showPageSize) && (
          <div className={cx("flex items-center justify-between", sizeCls)}>
            {showSummary ? (
              <div className="text-muted-foreground">
                {renderSummary ? (
                  renderSummary(from, to, total)
                ) : (
                  <span>
                    {from}–{to} de {total}
                  </span>
                )}
              </div>
            ) : (
              <span />
            )}

            {showPageSize && onPageSizeChange && (
              <label className="inline-flex items-center gap-2">
                <span className="text-muted-foreground">{label.pageSize}</span>
                <select
                  className={cx(
                    "rounded-md border border-border bg-surface px-2 py-1",
                    "focus:outline-none focus:ring-2 focus:ring-ring",
                    size === "sm"
                      ? "text-xs"
                      : size === "lg"
                      ? "text-base"
                      : "text-sm"
                  )}
                  value={pageSize}
                  onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                  disabled={disabled}
                >
                  {pageSizeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}

        {/* Bottom row: page controls */}
        <div className={cx("w-full flex items-center justify-center", sizeCls)}>
          <ul className={cx("flex items-center", gapCls)} role="list">
            {/* First / Prev */}
            {showFirstLast && (
              <li>
                <PageBtn
                  ariaLabel={label.first}
                  disabled={disabled || page <= 1}
                  onClick={first}
                  sizeCls={btnCls}
                  baseCls={variantBtn}
                  activeCls=""
                  icon={<ChevronDoubleLeft className={iconCls} aria-hidden />}
                />
              </li>
            )}
            {showPrevNext && (
              <li>
                <PageBtn
                  ariaLabel={label.previous}
                  disabled={disabled || page <= 1}
                  onClick={prev}
                  sizeCls={btnCls}
                  baseCls={variantBtn}
                  activeCls=""
                  icon={<ChevronLeft className={iconCls} aria-hidden />}
                />
              </li>
            )}

            {/* Range */}
            {items.map((it, i) =>
              it === "ellipsis" ? (
                <li key={`e-${i}`}>
                  <Ellipsis sizeCls={btnCls} variantBtn={variantBtn} />
                </li>
              ) : (
                <li key={it}>
                  <PageBtn
                    ariaLabel={label.page?.(it)}
                    active={page === it}
                    onClick={() => goTo(it)}
                    disabled={disabled}
                    sizeCls={btnCls}
                    baseCls={variantBtn}
                    activeCls={activeBtn}
                    truncate={truncate}
                  >
                    {it}
                  </PageBtn>
                </li>
              )
            )}

            {/* Next / Last */}
            {showPrevNext && (
              <li>
                <PageBtn
                  ariaLabel={label.next}
                  disabled={disabled || page >= totalPages}
                  onClick={next}
                  sizeCls={btnCls}
                  baseCls={variantBtn}
                  activeCls=""
                  icon={<ChevronRight className={iconCls} aria-hidden />}
                />
              </li>
            )}
            {showFirstLast && (
              <li>
                <PageBtn
                  ariaLabel={label.last}
                  disabled={disabled || page >= totalPages}
                  onClick={last}
                  sizeCls={btnCls}
                  baseCls={variantBtn}
                  activeCls=""
                  icon={<ChevronDoubleRight className={iconCls} aria-hidden />}
                />
              </li>
            )}
          </ul>
        </div>
      </motion.nav>
    );
  }
);

Pagination.displayName = "Pagination";

/* ===================== Subcomponentes ===================== */

function PageBtn({
  children,
  icon,
  active,
  disabled,
  ariaLabel,
  onClick,
  sizeCls,
  baseCls,
  activeCls,
  truncate,
}: {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  onClick?: () => void;
  sizeCls: string;
  baseCls: string;
  activeCls: string;
  truncate?: boolean;
}) {
  const common = cx(
    "inline-flex items-center justify-center select-none",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  );

  const cls = cx(sizeCls, common, active ? activeCls : baseCls);

  return (
    <motion.button
      type="button"
      className={cls}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      {icon ? (
        icon
      ) : (
        <span className={truncate ? "truncate" : undefined}>{children}</span>
      )}
    </motion.button>
  );
}

function Ellipsis({
  sizeCls,
  variantBtn,
}: {
  sizeCls: string;
  variantBtn: string;
}) {
  return (
    <span
      className={cx(
        sizeCls,
        "inline-grid place-items-center select-none rounded-md",
        variantBtn
      )}
      aria-hidden="true"
    >
      …
    </span>
  );
}

/* ===================== Iconos mínimos (Lucide-like) ===================== */
/* Si ya usas lucide-react, puedes reemplazar estos por:
   import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
   y adaptar className. Los de abajo son íconos SVG simples inline. */

function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 18l-6-6 6-6"
      />
    </svg>
  );
}
function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 6l6 6-6 6"
      />
    </svg>
  );
}
function ChevronDoubleLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 6l-6 6 6 6M12 6l-6 6 6 6"
      />
    </svg>
  );
}
function ChevronDoubleRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18l6-6-6-6M12 18l6-6-6-6"
      />
    </svg>
  );
}

export default Pagination;
