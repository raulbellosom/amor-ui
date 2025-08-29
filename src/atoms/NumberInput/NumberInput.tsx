// NumberInput.tsx
import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { Minus, Plus } from "lucide-react";

type Size = "xs" | "sm" | "md" | "lg" | "xl";
type Variant = "outlined" | "filled";

type BaseProps = {
  label?: React.ReactNode;
  placeholder?: string;

  /** Valor controlado. Puede ser number o string; se parsea con seguridad. */
  value?: number | string;
  /** Valor inicial si lo usas de forma no controlada. */
  defaultValue?: number;

  onChange?: (nextValue: number) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;

  min?: number;
  max?: number;
  step?: number;
  /** Cantidad de decimales que se permite/visualiza. */
  precision?: number;

  /** Locale para formatear al perder foco (agrupadores de miles, decimales). */
  locale?: string;

  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;

  /** Mensaje de error; si existe, prevalece sobre success. */
  error?: string;
  /** Estado visual de éxito. */
  success?: boolean;

  /** Texto de ayuda debajo del input. */
  helperText?: React.ReactNode;

  size?: Size;
  variant?: Variant;
  /** Muestra u oculta los botones de step. */
  showStepper?: boolean;

  className?: string;
  id?: string;
  name?: string;
  autoComplete?: string;
  autoFocus?: boolean;

  "aria-describedby"?: string;
};

type NativeProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  | "size"
  | "onChange"
  | "value"
  | "defaultValue"
  | "onBlur"
  | "onFocus"
  | "min"
  | "max"
  | "step"
  | "id"
  | "name"
  | "required"
>;

type PlainProps = BaseProps &
  NativeProps & {
    /** Usa <input> estándar (sin motion). */
    asMotion?: false;
  };

type MotionProps = BaseProps &
  Omit<HTMLMotionProps<"input">, "onChange" | "value" | "ref"> & {
    /** Usa <motion.input> con props de motion. */
    asMotion: true;
  };

export type NumberInputProps = PlainProps | MotionProps;

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (props, ref) => {
    const {
      label,
      placeholder,
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      min = Number.NEGATIVE_INFINITY,
      max = Number.POSITIVE_INFINITY,
      step = 1,
      precision = 0,
      locale = "es-MX",

      disabled = false,
      readOnly = false,
      required = false,

      error,
      success,
      helperText,

      size = "md",
      variant = "outlined",
      showStepper = true,

      className = "",
      id,
      name,
      autoComplete,
      autoFocus = false,
      asMotion,
      ...rest
    } = props as NumberInputProps;

    // ---- Estado interno de visualización ----
    const [focused, setFocused] = React.useState(false);
    const isControlled = value !== undefined;

    // parse seguro
    const parseNum = React.useCallback((raw: unknown): number => {
      if (raw === "" || raw === null || raw === undefined) return 0;
      if (typeof raw === "number") return raw;
      if (typeof raw !== "string") return 0;
      // admite "-", ".", ","
      const cleaned = raw.replace(/[^\d.,-]/g, "").replace(/,/g, ".");
      const n = parseFloat(cleaned);
      return Number.isFinite(n) ? n : 0;
    }, []);

    const [internalValue, setInternalValue] = React.useState<number>(
      isControlled ? parseNum(value) : defaultValue ?? 0
    );
    const [displayValue, setDisplayValue] = React.useState<string>("");

    // formateador por locale y precision
    const formatter = React.useMemo(
      () =>
        new Intl.NumberFormat(locale, {
          minimumFractionDigits: precision,
          maximumFractionDigits: precision,
        }),
      [locale, precision]
    );

    const clamp = React.useCallback(
      (n: number) => Math.max(min, Math.min(max, n)),
      [min, max]
    );

    const format = React.useCallback(
      (n: number) => {
        // para 0 y sin “valor real” mostramos vacío (mejor UX en filtros)
        if (!focused && n === 0 && !isControlled && !defaultValue) return "";
        return precision > 0 ? formatter.format(n) : formatter.format(n);
      },
      [formatter, precision, focused, isControlled, defaultValue]
    );

    // sync cuando value controlado cambia
    React.useEffect(() => {
      if (isControlled) {
        const parsed = parseNum(value);
        setInternalValue(parsed);
        setDisplayValue(focused ? String(parsed) : format(parsed));
      }
    }, [isControlled, value, parseNum, focused, format]);

    // IDs accesibles
    const autoId = React.useId();
    const inputId = id ?? `number-input-${autoId}`;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const hasError = Boolean(error);
    const hasSuccess = Boolean(success) && !hasError;

    // Tamaños (con paddings para steppers)
    const sizeMap = {
      xs: {
        input: "px-9 py-1.5 text-sm rounded-lg",
        btn: "w-7 h-7",
        icon: "w-3.5 h-3.5",
      },
      sm: {
        input: "px-10 py-2 text-base rounded-lg",
        btn: "w-8 h-8",
        icon: "w-4 h-4",
      },
      md: {
        input: "px-12 py-2.5 text-base rounded-xl",
        btn: "w-9 h-9",
        icon: "w-5 h-5",
      },
      lg: {
        input: "px-14 py-3 text-lg rounded-xl",
        btn: "w-10 h-10",
        icon: "w-6 h-6",
      },
      xl: {
        input: "px-16 py-4 text-xl rounded-2xl",
        btn: "w-11 h-11",
        icon: "w-7 h-7",
      },
    } as const;
    const s = sizeMap[size] ?? sizeMap.md;

    const baseField =
      "w-full border text-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed read-only:bg-gray-50 dark:read-only:bg-gray-800";
    const outlined =
      "bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-500";
    const filled =
      "bg-gray-50 border-transparent hover:bg-gray-100 focus:bg-white focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:hover:bg-gray-700";
    const state = hasError
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : hasSuccess
      ? "border-green-500 focus:border-green-500 focus:ring-green-500"
      : "";

    const inputClass = cx(
      baseField,
      variant === "filled" ? filled : outlined,
      s.input,
      state,
      showStepper && "pl-12 pr-12",
      className
    );

    const stepBtn =
      "absolute top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-md border border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-30 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 transition-all active:scale-95";

    // Handlers
    const emit = (n: number) => {
      const clamped = clamp(Number.isFinite(n) ? n : 0);
      if (!isControlled) setInternalValue(clamped);
      onChange?.(clamped);
      setDisplayValue(focused ? String(clamped) : format(clamped));
    };

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      const raw = e.target.value;
      // permitimos vacío o patrón numérico válido
      if (raw === "" || /^-?\d*([.,]\d*)?$/.test(raw)) {
        setDisplayValue(raw);
        const parsed = parseNum(raw);
        if (!focused) emit(parsed);
        else {
          // en focus, solo actualiza internal; se emite en blur o enter
          if (!isControlled) setInternalValue(parsed);
        }
      }
    };

    const stepBy = (delta: number) => {
      if (disabled || readOnly) return;
      const base = isControlled ? parseNum(value) : internalValue;
      const next = clamp(
        Number((base + delta).toFixed(Math.max(0, precision)))
      );
      emit(next);
    };

    const handleIncrement = () => stepBy(step);
    const handleDecrement = () => stepBy(-step);

    const handleFocusLocal: React.FocusEventHandler<HTMLInputElement> = (e) => {
      setFocused(true);
      const current = isControlled ? parseNum(value) : internalValue;
      setDisplayValue(String(current || ""));
      onFocus?.(e);
    };

    const handleBlurLocal: React.FocusEventHandler<HTMLInputElement> = (e) => {
      setFocused(false);
      const raw = isControlled ? parseNum(value) : parseNum(displayValue);
      const rounded = Number(raw.toFixed(Math.max(0, precision)));
      emit(rounded);
      onBlur?.(e);
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
      if (disabled || readOnly) return;
      if (e.key === "ArrowUp") {
        e.preventDefault();
        stepBy(step);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        stepBy(-step);
      } else if (e.key === "PageUp") {
        e.preventDefault();
        stepBy(step * 10);
      } else if (e.key === "PageDown") {
        e.preventDefault();
        stepBy(-step * 10);
      } else if (e.key === "Enter") {
        e.currentTarget.blur();
      }
    };

    const current = isControlled
      ? clamp(parseNum(value))
      : clamp(internalValue);
    const canInc = current < max && !disabled && !readOnly;
    const canDec = current > min && !disabled && !readOnly;

    const describedBy =
      [
        helperText ? helperId : undefined,
        hasError ? errorId : undefined,
        props["aria-describedby"],
      ]
        .filter(Boolean)
        .join(" ") || undefined;

    const InputTag = asMotion ? motion.input : "input";

    return (
      <div className={cx("w-full", className)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cx(
              "mb-1 block text-sm font-medium",
              hasError
                ? "text-red-700 dark:text-red-400"
                : "text-gray-700 dark:text-gray-300",
              disabled && "opacity-60"
            )}
          >
            {label}
            {required && (
              <span className="ml-1 text-red-500" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          <InputTag
            ref={ref as any}
            id={inputId}
            name={name}
            type="text"
            inputMode="decimal"
            value={
              focused
                ? displayValue
                : format(isControlled ? parseNum(value) : internalValue)
            }
            onChange={handleChange}
            onFocus={handleFocusLocal}
            onBlur={handleBlurLocal}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            min={min}
            max={max}
            step={step}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            className={inputClass}
            {...(rest as any)}
          />

          {showStepper && (
            <>
              <button
                type="button"
                onClick={handleDecrement}
                disabled={!canDec}
                className={cx(stepBtn, s.btn, "left-1")}
                aria-label="Disminuir valor"
              >
                <Minus className={s.icon} aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={handleIncrement}
                disabled={!canInc}
                className={cx(stepBtn, s.btn, "right-1")}
                aria-label="Aumentar valor"
              >
                <Plus className={s.icon} aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {helperText && !hasError && (
          <p
            id={helperId}
            className="mt-1 text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}

        {hasError && (
          <p
            id={errorId}
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";

export default NumberInput;
