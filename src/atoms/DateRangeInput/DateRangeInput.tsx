import * as React from "react";

type DayKey = `${number}-${number}-${number}`;
export type DateRange = { startDate: Date | null; endDate: Date | null };

export type DateRangeVariant = "solid" | "soft" | "ghost" | "glass"; // glass = semitransparente
export type DateRangeSize = "sm" | "md" | "lg";

/**
 * NOTA DE TIPADO:
 * - Usamos ButtonHTMLAttributes<HTMLButtonElement> porque el trigger es un <button>.
 * - Excluimos "type" para fijarlo a "button" internamente y evitar choques.
 * - "onChange" lo reservamos para cambios de rango (DateRange), no para eventos nativos.
 */
export interface DateRangeInputProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "type" | "onChange" | "value"
  > {
  value?: DateRange;
  onChange?: (next: DateRange) => void;
  placeholder?: string;

  /** Límites con Date (no chocan con los del input nativo) */
  min?: Date;
  max?: Date;
  disabledDates?: (d: Date) => boolean;

  locale?: string; // p. ej. "es-MX"
  firstDayOfWeek?: 0 | 1; // 0=Dom, 1=Lun
  /** Si no se fija, es responsivo: 1 (móvil) / 2 (md+) */
  numberOfMonths?: 1 | 2;

  showToday?: boolean;
  clearable?: boolean;
  showNightsBadge?: boolean;

  /** Precios por día (opcional) */
  pricing?: Partial<Record<DayKey, number>>;

  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string | boolean;

  variant?: DateRangeVariant;
  size?: DateRangeSize;

  className?: string;
}

const strip = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a: Date | null, b: Date | null) =>
  !!a &&
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const keyOf = (d: Date): DayKey =>
  `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(
    2,
    "0"
  )}-${`${d.getDate()}`.padStart(2, "0")}` as DayKey;
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const addMonths = (d: Date, m: number) =>
  new Date(d.getFullYear(), d.getMonth() + m, 1);

function monthGrid(base: Date, firstDay: 0 | 1) {
  // 6 filas * 7 cols, incluyendo adyacentes
  const first = startOfMonth(base);
  const offset = (first.getDay() + (7 - firstDay)) % 7;
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - offset);
  const cells: Date[] = [];
  const cur = new Date(gridStart);
  // llenamos hasta cubrir el mes (y cerrar la semana)
  do {
    cells.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  } while (cur <= endOfMonth(base) || cur.getDay() !== firstDay);
  return cells;
}

export const DateRangeInput = React.forwardRef<
  HTMLButtonElement,
  DateRangeInputProps
>(
  (
    {
      value = { startDate: null, endDate: null },
      onChange,
      min,
      max,
      disabled = false,
      disabledDates,
      locale = "es-MX",
      firstDayOfWeek = 1,
      numberOfMonths,
      showToday = true,
      clearable = true,
      showNightsBadge = true,
      pricing,
      label,
      description,
      error,
      placeholder = "Selecciona fechas",
      variant = "solid",
      size = "md",
      className = "",
      id,
      name,
      // Quitamos del resto props potencialmente peligrosos para no pasarlos al <button>
      // (ya excluimos "type" y "onChange" por interfaz)
      ...restButtonProps
    },
    ref
  ) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;

    const [open, setOpen] = React.useState(false);
    const isControlled = typeof value !== "undefined";
    const [internal, setInternal] = React.useState<DateRange>(value);
    React.useEffect(() => {
      if (isControlled) setInternal(value);
    }, [isControlled, value]);

    const current = isControlled ? value : internal;

    // Mes actual visible (primer mes del rango o hoy)
    const [month, setMonth] = React.useState<Date>(() =>
      startOfMonth(current.startDate || new Date())
    );

    // Responsive: 1 mes en móvil, 2 en md+ (si no se fija por prop)
    const [autoMonths, setAutoMonths] = React.useState<1 | 2>(2);
    React.useLayoutEffect(() => {
      if (typeof window === "undefined" || numberOfMonths) return;
      const mq = window.matchMedia("(max-width: 767px)");
      const check = () => setAutoMonths(mq.matches ? 1 : 2);
      check();
      mq.addEventListener("change", check);
      return () => mq.removeEventListener("change", check);
    }, [numberOfMonths]);
    const monthsToShow: 1 | 2 = numberOfMonths ?? autoMonths;

    // i18n/formatos
    const dayFmt = new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
    });
    const monthFmt = new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
    });

    // utilidades de validación
    const outOfRange = (d: Date) =>
      (min && strip(d) < strip(min)) || (max && strip(d) > strip(max));
    const isDisabled = (d: Date) => !!(disabledDates?.(d) || outOfRange(d));

    // hover range preview
    const [hoverDate, setHoverDate] = React.useState<Date | null>(null);
    const inSelectedRange = (d: Date) => {
      const { startDate, endDate } = current;
      return !!(
        startDate &&
        endDate &&
        strip(d) >= strip(startDate) &&
        strip(d) <= strip(endDate)
      );
    };
    const inHoverRange = (d: Date) => {
      const { startDate, endDate } = current;
      if (!startDate || endDate != null || !hoverDate) return false;
      const a = strip(startDate < hoverDate ? startDate : hoverDate);
      const b = strip(startDate < hoverDate ? hoverDate : startDate);
      const s = strip(d);
      return s >= a && s <= b;
    };

    const nights =
      current.startDate && current.endDate
        ? Math.ceil(
            (+strip(current.endDate) - +strip(current.startDate)) / 86400000
          )
        : 0;

    const setRange = (r: DateRange) => {
      if (disabled) return;
      if (isControlled) onChange?.(r);
      else setInternal(r);
    };

    const pick = (d: Date) => {
      if (isDisabled(d) || disabled) return;
      const { startDate, endDate } = current;
      if (!startDate) {
        setRange({ startDate: strip(d), endDate: null });
      } else if (!endDate) {
        if (sameDay(d, startDate)) {
          setRange({ startDate: null, endDate: null });
        } else if (d < startDate) {
          setRange({ startDate: strip(d), endDate: null });
        } else {
          setRange({ startDate, endDate: strip(d) });
        }
      } else {
        setRange({ startDate: strip(d), endDate: null });
      }
    };

    // teclado en grid
    const [focusDay, setFocusDay] = React.useState<Date | null>(
      current.startDate || null
    );
    const onGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!focusDay) return;
      const n = new Date(focusDay);
      if (e.key === "ArrowRight") n.setDate(n.getDate() + 1);
      else if (e.key === "ArrowLeft") n.setDate(n.getDate() - 1);
      else if (e.key === "ArrowDown") n.setDate(n.getDate() + 7);
      else if (e.key === "ArrowUp") n.setDate(n.getDate() - 7);
      else if (e.key === "Home") n.setDate(1);
      else if (e.key === "End") n.setDate(endOfMonth(n).getDate());
      else if (e.key === "PageUp") n.setMonth(n.getMonth() - 1);
      else if (e.key === "PageDown") n.setMonth(n.getMonth() + 1);
      else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        pick(focusDay);
        return;
      } else if (e.key === "Escape") {
        setOpen(false);
        return;
      } else {
        return;
      }
      e.preventDefault();
      setFocusDay(n);
      setMonth(startOfMonth(n));
    };

    // estilos (tokens + variantes + tamaños)
    const sizes: Record<
      DateRangeSize,
      { px: string; text: string; icon: string }
    > = {
      sm: { px: "px-2 py-1.5", text: "text-sm", icon: "w-4 h-4" },
      md: { px: "px-3 py-2", text: "text-sm", icon: "w-4 h-4" },
      lg: { px: "px-4 py-3", text: "text-base", icon: "w-5 h-5" },
    };

    const variants: Record<DateRangeVariant, string> = {
      solid: "bg-surface border border-border",
      soft: "bg-muted/60 border border-border",
      ghost: "bg-transparent border border-border/60",
      glass: "backdrop-blur bg-background/60 border border-border/40", // semitransparente
    };

    const triggerCls = [
      "w-full rounded-lg shadow-sm inline-flex items-center justify-between gap-2",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
      "text-foreground",
      sizes[size].px,
      sizes[size].text,
      variants[variant],
      disabled
        ? "opacity-50 cursor-not-allowed"
        : "cursor-pointer hover:bg-muted/50",
      className,
    ].join(" ");

    const inputVis =
      current.startDate && current.endDate
        ? `${dayFmt.format(current.startDate)} – ${dayFmt.format(
            current.endDate
          )}${
            showNightsBadge && nights
              ? ` · ${nights} ${nights === 1 ? "noche" : "noches"}`
              : ""
          }`
        : placeholder;

    // cierre por click afuera
    const wrapRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
      const onDoc = (e: MouseEvent) => {
        if (!wrapRef.current) return;
        if (wrapRef.current.contains(e.target as Node)) return;
        setOpen(false);
      };
      document.addEventListener("mousedown", onDoc);
      return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    const MonthGrid: React.FC<{ base: Date }> = ({ base }) => {
      const days = monthGrid(base, firstDayOfWeek);
      const inThisMonth = (d: Date) => d.getMonth() === base.getMonth();
      return (
        <div className={monthsToShow === 1 ? "p-3 w-full" : "p-4 w-80"}>
          {/* encabezados */}
          <div className="grid grid-cols-7 gap-1 mb-2 text-xs text-muted-foreground">
            {Array.from({ length: 7 }).map((_, i) => {
              const baseDay = (firstDayOfWeek + i) % 7;
              const probe = new Date(
                2024,
                8,
                1 + ((baseDay - new Date(2024, 8, 1).getDay() + 7) % 7)
              );
              return (
                <div key={i} className="h-7 grid place-items-center">
                  {new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
                    probe
                  )}
                </div>
              );
            })}
          </div>
          {/* días */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, idx) => {
              const disabledDay = isDisabled(d);
              const selected =
                sameDay(d, current.startDate) || sameDay(d, current.endDate);
              const inRange = inSelectedRange(d) || inHoverRange(d);
              const price = pricing?.[keyOf(d)];
              const baseBtn =
                "relative h-12 w-full flex flex-col items-center justify-center rounded-lg text-sm transition-colors";
              const tone = disabledDay
                ? "opacity-30 cursor-not-allowed line-through"
                : "hover:bg-muted cursor-pointer";
              const color = selected
                ? "bg-brand-600 text-white shadow"
                : inRange
                ? "bg-brand-50 dark:bg-brand-900/20 text-brand-900 dark:text-brand-100"
                : inThisMonth(d)
                ? "text-foreground"
                : "text-muted-foreground/60";
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={disabledDay || disabled}
                  onClick={() => pick(d)}
                  onMouseEnter={() => setHoverDate(d)}
                  onMouseLeave={() => setHoverDate(null)}
                  className={[baseBtn, tone, color].join(" ")}
                  aria-pressed={selected}
                >
                  <span className="font-medium">{d.getDate()}</span>
                  {price && !disabledDay && inThisMonth(d) && (
                    <span className="text-[11px] text-muted-foreground">
                      ${price}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      );
    };

    const header = (
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, -1))}
            className="p-2 rounded-md hover:bg-muted"
            aria-label="Mes anterior"
          >
            ‹
          </button>
          <span className="min-w-[200px] text-center capitalize">
            {monthFmt.format(month)}
            {monthsToShow === 2 && (
              <>
                <span className="mx-2">–</span>
                {monthFmt.format(addMonths(month, 1))}
              </>
            )}
          </span>
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, +1))}
            className="p-2 rounded-md hover:bg-muted"
            aria-label="Mes siguiente"
          >
            ›
          </button>
        </div>

        <div className="flex items-center gap-2">
          {showNightsBadge && current.startDate && current.endDate && (
            <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
              {nights} {nights === 1 ? "noche" : "noches"}
            </span>
          )}
          {(current.startDate || current.endDate) && (
            <button
              type="button"
              onClick={() => setRange({ startDate: null, endDate: null })}
              className="text-xs px-3 py-1 rounded-md border border-transparent hover:border-border text-muted-foreground"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>
    );

    const panelCls = [
      "absolute z-50 mt-2 rounded-xl border border-border shadow-xl",
      "bg-surface text-foreground",
      variant === "glass" ? "backdrop-blur bg-background/70" : "",
      monthsToShow === 1 ? "w-[22rem]" : "w-[44rem]",
    ].join(" ");

    return (
      <div
        className={["flex flex-col gap-1", className].join(" ")}
        ref={wrapRef}
      >
        {label && (
          <label
            htmlFor={inputId}
            className={`text-sm font-medium ${
              error ? "text-red-600 dark:text-red-400" : "text-foreground"
            }`}
          >
            {label}
          </label>
        )}

        {/* Trigger (BOTÓN) */}
        <button
          ref={ref}
          id={inputId}
          name={name ?? inputId}
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={triggerCls}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={`${inputId}-panel`}
          {...restButtonProps}
        >
          <span className="truncate">{inputVis}</span>
          <span aria-hidden className={sizes[size].icon}>
            📅
          </span>
        </button>

        {/* Panel calendario */}
        {open && (
          <div
            id={`${inputId}-panel`}
            role="dialog"
            aria-modal="false"
            className={panelCls}
          >
            {header}

            <div
              role="grid"
              aria-label="Calendario de rango"
              tabIndex={0}
              onKeyDown={onGridKeyDown}
              className={
                monthsToShow === 1 ? "grid grid-cols-1" : "grid grid-cols-2"
              }
            >
              <MonthGrid base={month} />
              {monthsToShow === 2 && <MonthGrid base={addMonths(month, 1)} />}
            </div>

            <div className="flex items-center justify-between p-3 border-t border-border">
              {showToday && (
                <button
                  type="button"
                  className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-muted"
                  onClick={() => {
                    const today = strip(new Date());
                    setMonth(startOfMonth(today));
                    setFocusDay(today);
                    pick(today);
                  }}
                >
                  Hoy
                </button>
              )}
              <button
                type="button"
                className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {error && typeof error === "string" && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

DateRangeInput.displayName = "DateRangeInput";
export default DateRangeInput;
