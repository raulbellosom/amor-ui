import * as React from "react";

// ------------ Tipos
export interface DateInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "min" | "max"
  > {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  min?: Date;
  max?: Date;
  disabledDates?: (date: Date) => boolean; // p.ej. (d) => d < today
  locale?: string; // p.ej. "es-MX"
  displayFormat?: Intl.DateTimeFormatOptions; // para formateo en input
  firstDayOfWeek?: 0 | 1; // 0=Domingo, 1=Lunes
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string | boolean;
  clearable?: boolean;
  showToday?: boolean;
  className?: string;
}

// ------------ Utilidades de fecha
const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const addMonths = (date: Date, months: number) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};
const clamp = (d: Date, min?: Date, max?: Date) => {
  if (min && d < min) return startOfDay(min);
  if (max && d > max) return startOfDay(max);
  return d;
};
function getMonthMatrix(viewDate: Date, firstDay: 0 | 1) {
  // Construye una matriz 6x7 de fechas visibles (incluye días adyacentes)
  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const firstWeekDay = (firstOfMonth.getDay() + (7 - firstDay)) % 7; // shift por primer día
  const start = new Date(firstOfMonth);
  start.setDate(firstOfMonth.getDate() - firstWeekDay);

  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const row: Date[] = [];
    for (let d = 0; d < 7; d++) {
      const cell = new Date(start);
      cell.setDate(start.getDate() + w * 7 + d);
      row.push(cell);
    }
    weeks.push(row);
  }
  return weeks;
}

// ------------ Componente
export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      value = null,
      onChange,
      min,
      max,
      disabled = false,
      disabledDates,
      locale = "es-MX",
      displayFormat = { year: "numeric", month: "2-digit", day: "2-digit" },
      firstDayOfWeek = 1,
      label,
      description,
      error,
      placeholder = "Selecciona una fecha",
      clearable = true,
      showToday = true,
      className = "",
      id,
      name,
      ...rest
    },
    ref
  ) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    const [isOpen, setIsOpen] = React.useState(false);
    const [viewDate, setViewDate] = React.useState<Date>(() =>
      startOfDay(value || new Date())
    );
    const [focusedDay, setFocusedDay] = React.useState<Date | null>(
      value ? startOfDay(value) : null
    );

    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const gridRef = React.useRef<HTMLDivElement>(null);

    // Cerrar al hacer click fuera
    React.useEffect(() => {
      function onDocClick(e: MouseEvent) {
        if (!wrapperRef.current) return;
        if (wrapperRef.current.contains(e.target as Node)) return;
        setIsOpen(false);
      }
      document.addEventListener("mousedown", onDocClick);
      return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    // Asegurar viewDate dentro de min/max
    React.useEffect(() => {
      setViewDate((vd) => clamp(vd, min, max));
    }, [min, max]);

    const fmt = new Intl.DateTimeFormat(locale, displayFormat);
    const monthFmt = new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
    });

    const weeks = React.useMemo(
      () => getMonthMatrix(viewDate, firstDayOfWeek),
      [viewDate, firstDayOfWeek]
    );

    const isOutOfRange = (d: Date) =>
      (min && d < startOfDay(min)) || (max && d > startOfDay(max));

    const isDisabled = (d: Date) =>
      !!(disabledDates && disabledDates(d)) || isOutOfRange(d);

    const open = () => {
      if (disabled) return;
      setIsOpen(true);
      setFocusedDay(startOfDay(value || viewDate));
    };

    const selectDate = (d: Date) => {
      if (isDisabled(d) || disabled) return;
      const day = startOfDay(d);
      onChange?.(day);
      setIsOpen(false);
    };

    const clearDate = () => {
      if (disabled) return;
      onChange?.(null);
      setFocusedDay(null);
    };

    // Navegación por teclado dentro del grid
    const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!focusedDay) return;
      let next = new Date(focusedDay);
      if (e.key === "ArrowRight") next.setDate(focusedDay.getDate() + 1);
      else if (e.key === "ArrowLeft") next.setDate(focusedDay.getDate() - 1);
      else if (e.key === "ArrowDown") next.setDate(focusedDay.getDate() + 7);
      else if (e.key === "ArrowUp") next.setDate(focusedDay.getDate() - 7);
      else if (e.key === "Home")
        next = new Date(focusedDay.getFullYear(), focusedDay.getMonth(), 1);
      else if (e.key === "End")
        next = new Date(focusedDay.getFullYear(), focusedDay.getMonth() + 1, 0);
      else if (e.key === "PageUp") next = addMonths(focusedDay, -1);
      else if (e.key === "PageDown") next = addMonths(focusedDay, 1);
      else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectDate(focusedDay);
        return;
      } else if (e.key === "Escape") {
        setIsOpen(false);
        return;
      } else {
        return;
      }
      e.preventDefault();
      setFocusedDay(next);
      setViewDate(new Date(next.getFullYear(), next.getMonth(), 1));
    };

    // Calendario: cabecera y grid
    const WeekdayHeaders = () => {
      const base = firstDayOfWeek === 1 ? 1 : 0;
      const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
      return (
        <div className="grid grid-cols-7 text-xs text-muted-foreground">
          {Array.from({ length: 7 }).map((_, i) => {
            const day = (base + i) % 7;
            // Usamos una fecha fija que tenga ese day-of-week
            const sample = new Date(
              2024,
              8,
              1 + ((day - new Date(2024, 8, 1).getDay() + 7) % 7)
            );
            return (
              <div key={i} className="text-center py-1">
                {formatter.format(sample)}
              </div>
            );
          })}
        </div>
      );
    };

    const DayCell: React.FC<{ day: Date }> = ({ day }) => {
      const isCurrentMonth = day.getMonth() === viewDate.getMonth();
      const selected = value ? isSameDay(day, value) : false;
      const today = isSameDay(day, new Date());
      const disabledDay = isDisabled(day);

      const base =
        "w-9 h-9 grid place-items-center rounded-full text-sm transition-colors";
      const colors = selected
        ? "bg-brand-600 text-white hover:bg-brand-700"
        : disabledDay
        ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
        : isCurrentMonth
        ? "text-foreground hover:bg-muted/60"
        : "text-muted-foreground/60 hover:bg-muted/40";

      const ring =
        focusedDay && isSameDay(day, focusedDay)
          ? "ring-2 ring-ring ring-offset-2"
          : "";

      return (
        <button
          type="button"
          onClick={() => selectDate(day)}
          onMouseEnter={() => setFocusedDay(day)}
          disabled={disabledDay || disabled}
          className={[base, colors, ring].filter(Boolean).join(" ")}
          aria-current={today ? "date" : undefined}
          aria-pressed={selected}
        >
          <span className={today && !selected ? "relative" : undefined}>
            {day.getDate()}
            {today && !selected ? (
              <span className="absolute -right-1 -top-1 w-1.5 h-1.5 rounded-full bg-brand-500" />
            ) : null}
          </span>
        </button>
      );
    };

    const Header = () => (
      <div className="flex items-center justify-between px-2 py-2">
        <button
          type="button"
          className="p-2 rounded-md hover:bg-muted"
          onClick={() => setViewDate((d) => addMonths(d, -1))}
          aria-label="Mes anterior"
        >
          ‹
        </button>
        <div className="text-sm font-medium capitalize">
          {monthFmt.format(viewDate)}
        </div>
        <button
          type="button"
          className="p-2 rounded-md hover:bg-muted"
          onClick={() => setViewDate((d) => addMonths(d, 1))}
          aria-label="Mes siguiente"
        >
          ›
        </button>
      </div>
    );

    // Clases visuales — tokens + estados
    const inputBase =
      "w-full rounded-lg border bg-surface text-foreground placeholder:text-muted-foreground";
    const inputStates =
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background";
    const inputSizing = "px-3 py-2 text-sm";
    const inputError = error ? "border-red-500" : "border-border";
    const inputDisabled = disabled ? "opacity-50 cursor-not-allowed" : "";

    const popoverBase =
      "absolute z-50 mt-2 w-[19.5rem] rounded-xl border border-border bg-surface shadow-xl";
    const popoverInner = "p-3";
    const gridBase = "grid grid-cols-7 gap-1";

    const labelClass = [
      "text-sm font-medium",
      error ? "text-red-600 dark:text-red-400" : "text-foreground",
    ].join(" ");

    const helpClass = "text-xs text-muted-foreground mt-1";
    const errorClass = "text-xs text-red-600 dark:text-red-400 mt-1";

    return (
      <div
        className={["flex flex-col gap-1", className].join(" ")}
        ref={wrapperRef}
      >
        {label && (
          <label htmlFor={inputId} className={labelClass}>
            {label}
          </label>
        )}

        <div className="relative">
          <div className="flex items-center gap-2">
            <input
              ref={ref}
              id={inputId}
              name={name ?? inputId}
              type="text"
              value={value ? fmt.format(value) : ""}
              onChange={() => {}}
              onFocus={open}
              onClick={open}
              onKeyDown={(e) => {
                // Abrir con Alt+ArrowDown o F4, cerrar con Escape
                if ((e.altKey && e.key === "ArrowDown") || e.key === "F4") {
                  open();
                } else if (e.key === "Escape") {
                  setIsOpen(false);
                }
              }}
              placeholder={placeholder}
              readOnly
              disabled={disabled}
              aria-haspopup="dialog"
              aria-expanded={isOpen}
              aria-controls={`${inputId}-calendar`}
              aria-invalid={!!error || undefined}
              className={[
                inputBase,
                inputStates,
                inputSizing,
                inputError,
                inputDisabled,
              ].join(" ")}
              {...rest}
            />
            {clearable && value && !disabled && (
              <button
                type="button"
                className="text-sm px-2 py-1 rounded-md border border-border hover:bg-muted"
                onClick={clearDate}
                aria-label="Limpiar fecha"
              >
                Limpiar
              </button>
            )}
            <button
              type="button"
              className="text-sm px-2 py-1 rounded-md border border-border hover:bg-muted"
              onClick={() => (isOpen ? setIsOpen(false) : open())}
              aria-label="Abrir calendario"
            >
              📅
            </button>
          </div>

          {isOpen && (
            <div
              id={`${inputId}-calendar`}
              role="dialog"
              aria-modal="false"
              className={popoverBase}
            >
              <div className={popoverInner}>
                <Header />

                <WeekdayHeaders />

                <div
                  ref={gridRef}
                  role="grid"
                  aria-label="Calendario"
                  tabIndex={0}
                  onKeyDown={handleGridKeyDown}
                  className={`${gridBase} mt-1`}
                >
                  {weeks.map((row, i) => (
                    <React.Fragment key={i}>
                      {row.map((d) => (
                        <div
                          key={d.toISOString()}
                          role="gridcell"
                          className="flex justify-center"
                        >
                          <DayCell day={d} />
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>

                <div className="mt-2 flex items-center justify-between">
                  {showToday && (
                    <button
                      type="button"
                      className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-muted"
                      onClick={() => {
                        const today = startOfDay(new Date());
                        setViewDate(
                          new Date(today.getFullYear(), today.getMonth(), 1)
                        );
                        setFocusedDay(today);
                        selectDate(today);
                      }}
                    >
                      Hoy
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-muted"
                      onClick={() => setIsOpen(false)}
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {description && <p className={helpClass}>{description}</p>}
        {error && typeof error === "string" && (
          <p className={errorClass}>{error}</p>
        )}
      </div>
    );
  }
);

DateInput.displayName = "DateInput";
export default DateInput;
