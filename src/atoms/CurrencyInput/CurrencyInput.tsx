// CurrencyInput.tsx
import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { X } from "lucide-react";

type InputBaseProps = {
  label?: React.ReactNode;
  placeholder?: string;
  /** Valor controlado. Puedes pasar número; si pasas string, se intentará parsear. */
  value?: number | string;
  onChange?: (nextValue: number) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;

  currency?: string; // e.g. "USD", "MXN"
  locale?: string; // e.g. "en-US", "es-MX"
  min?: number;
  max?: number;

  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;

  /** Mensaje de error; si existe, toma prioridad sobre success. */
  error?: string;
  /** Estado de éxito (solo estilo). */
  success?: boolean;

  /** Texto de ayuda bajo el input. */
  helperText?: React.ReactNode;

  /** xs/sm/md/lg/xl para compactar o ampliar padding y radius. */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** outlined | filled (ligero), manteniendo estilo sobrio. */
  variant?: "outlined" | "filled";

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
  | "required"
  | "id"
  | "name"
>;

type PlainProps = InputBaseProps &
  NativeProps & {
    /** Usa <input> estándar (sin motion). */
    asMotion?: false;
  };

type MotionProps = InputBaseProps &
  Omit<HTMLMotionProps<"input">, "onChange" | "value" | "ref"> & {
    /** Usa <motion.input> con props de motion. */
    asMotion: true;
  };

export type CurrencyInputProps = PlainProps | MotionProps;

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export const CurrencyInput = React.forwardRef<
  HTMLInputElement,
  CurrencyInputProps
>((props, ref) => {
  const {
    label,
    placeholder,
    value,
    onChange,
    onBlur,
    onFocus,
    currency = "USD",
    locale = "en-US",
    min = 0,
    max = 999_999_999,
    disabled = false,
    readOnly = false,
    required = false,
    error,
    success,
    helperText,
    size = "md",
    variant = "outlined",
    className = "",
    id,
    name,
    autoComplete,
    autoFocus = false,
    asMotion,
    ...rest
  } = props as CurrencyInputProps;

  const [focused, setFocused] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState<number>(
    typeof value === "number" ? value : 0
  );
  const [displayValue, setDisplayValue] = React.useState<string>("");

  // IDs accesibles
  const autoId = React.useId();
  const inputId = id ?? `currency-input-${autoId}`;
  const helperTextId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  const hasError = Boolean(error);
  const hasSuccess = Boolean(success) && !hasError;

  // Intl formatter
  const formatter = React.useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    [locale, currency]
  );

  // Parser seguro (admite dígitos, separadores y signo)
  const parseValue = React.useCallback(
    (formatted: string | number | undefined | null) => {
      if (formatted === "" || formatted === undefined || formatted === null)
        return 0;
      if (typeof formatted === "number") return formatted;
      const cleaned = formatted
        .replace(/[^\d.,-]/g, "")
        .replace(/,/g, ".")
        .replace(/\.+/g, "."); // colapsa múltiples puntos
      const num = parseFloat(cleaned);
      return Number.isFinite(num) ? num : 0;
    },
    []
  );

  const formatValue = React.useCallback(
    (num?: number) => {
      if (!num || num === 0) return "";
      return formatter.format(num);
    },
    [formatter]
  );

  // Sincroniza visual cuando cambia value controlado
  React.useEffect(() => {
    const base = value !== undefined ? parseValue(value) : internalValue;
    setInternalValue(base);
    setDisplayValue(focused ? (base ? String(base) : "") : formatValue(base));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, focused, formatValue, parseValue]);

  // Tamaños
  const sizeMap = {
    xs: {
      pad: "pl-11 pr-9 py-1 text-xs rounded",
      chip: "h-6 px-2 text-[10px]",
      radius: "rounded",
    },
    sm: {
      pad: "pl-12 pr-10 py-1.5 text-sm rounded-md",
      chip: "h-6 px-2.5 text-[11px]",
      radius: "rounded-md",
    },
    md: {
      pad: "pl-14 pr-11 py-2 text-base rounded-lg",
      chip: "h-7 px-2.5 text-xs",
      radius: "rounded-lg",
    },
    lg: {
      pad: "pl-16 pr-12 py-3 text-lg rounded-xl",
      chip: "h-8 px-3 text-sm",
      radius: "rounded-xl",
    },
    xl: {
      pad: "pl-18 pr-14 py-4 text-xl rounded-2xl",
      chip: "h-9 px-3.5 text-base",
      radius: "rounded-2xl",
    },
  } as const;
  const s = sizeMap[size] ?? sizeMap.md;

  // Variantes
  const isFilled = variant === "filled";
  const baseField =
    "w-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 text-right";
  const outlined =
    "bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:hover:border-gray-600";
  const filled =
    "bg-gray-50 border-transparent hover:bg-gray-100 focus:bg-white focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:bg-gray-800";
  const state = hasError
    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
    : hasSuccess
    ? "border-green-500 focus:border-green-500 focus:ring-green-500"
    : "";

  // Wrapper y adornos
  const wrapperBase = cx("relative", disabled && "opacity-60", className);

  const chipBase = cx(
    "absolute left-2 top-1/2 -translate-y-1/2",
    "inline-flex items-center justify-center rounded-full",
    "bg-gray-100 text-gray-700 border border-gray-200",
    "dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    "font-semibold select-none",
    s.chip
  );

  const clearBtnBase = cx(
    "absolute right-2 top-1/2 -translate-y-1/2",
    "inline-flex items-center justify-center rounded-full",
    "hover:bg-black/10 dark:hover:bg-white/10",
    "focus:outline-none focus:ring-2 focus:ring-blue-500",
    "transition-colors",
    "w-7 h-7"
  );

  const inputClass = cx(
    baseField,
    isFilled ? filled : outlined,
    state,
    s.pad,
    s.radius
  );

  // Handlers
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const raw = e.target.value;
    // Permitimos vacío o cadenas plausibles
    if (raw === "" || /^[\d.,\s-]+$/.test(raw)) {
      setDisplayValue(raw);
      const numeric = parseValue(raw);
      const clamped = Math.max(min, Math.min(max, numeric));
      setInternalValue(clamped);
      onChange?.(clamped);
    }
  };

  const handleFocusLocal: React.FocusEventHandler<HTMLInputElement> = (e) => {
    setFocused(true);
    const current = value !== undefined ? parseValue(value) : internalValue;
    setDisplayValue(current ? String(current) : "");
    onFocus?.(e);
  };

  const handleBlurLocal: React.FocusEventHandler<HTMLInputElement> = (e) => {
    setFocused(false);
    const current = value !== undefined ? parseValue(value) : internalValue;
    const clamped = Math.max(min, Math.min(max, current));
    setInternalValue(clamped);
    setDisplayValue(formatValue(clamped));
    onChange?.(clamped);
    onBlur?.(e);
  };

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (disabled || readOnly) return;
    setInternalValue(0);
    setDisplayValue("");
    onChange?.(0);
  };

  const ariaDescribed =
    [
      helperText ? helperTextId : undefined,
      hasError ? errorId : undefined,
      props["aria-describedby"],
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const InputTag = asMotion ? motion.input : "input";

  return (
    <div className={wrapperBase}>
      {label && (
        <label
          htmlFor={inputId}
          className={cx(
            "mb-1 block text-sm font-medium",
            hasError
              ? "text-red-700 dark:text-red-400"
              : "text-gray-700 dark:text-gray-300"
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

      {/* Chip de moneda */}
      <span className={chipBase} aria-hidden="true">
        {currency}
      </span>

      {/* Campo */}
      <InputTag
        ref={ref as any}
        id={inputId}
        name={name}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocusLocal}
        onBlur={handleBlurLocal}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        aria-describedby={ariaDescribed}
        aria-invalid={hasError}
        className={inputClass}
        {...(rest as any)}
      />

      {/* Botón limpiar (solo cuando hay valor y editable) */}
      {displayValue && !readOnly && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className={clearBtnBase}
          aria-label="Limpiar"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}

      {/* Helper / Error */}
      {helperText && !hasError && (
        <p
          id={helperTextId}
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
});

CurrencyInput.displayName = "CurrencyInput";

export default CurrencyInput;
