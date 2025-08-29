// TextInput.tsx
import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";

type IconType = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { className?: string }
>;

export type TextInputSize = "xs" | "sm" | "md" | "lg" | "xl";
export type TextInputVariant = "outlined" | "filled";

export type TextInputLabels = {
  clear?: string; // "Clear"
  showPassword?: string; // "Show password"
  hidePassword?: string; // "Hide password"
  charsRemaining?: (n: number) => string; // "12 characters left"
};

type NativeInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "onChange" | "value" | "defaultValue" | "onBlur" | "onFocus" | "type"
>;

type PlainProps = {
  label?: React.ReactNode;
  placeholder?: string;

  /** Comportamiento controlado/no-controlado estándar */
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;

  type?: React.HTMLInputTypeAttribute;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;

  error?: string;
  success?: boolean;
  helperText?: React.ReactNode;

  /** Íconos e indicadores decorativos */
  leftIcon?: IconType;
  rightIcon?: IconType;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;

  size?: TextInputSize;
  variant?: TextInputVariant;
  className?: string;
  id?: string;
  name?: string;
  autoComplete?: string;
  autoFocus?: boolean;

  /** Extras opcionales (no rompen el uso básico) */
  clearable?: boolean;
  passwordToggle?: boolean; // solo si type="password"
  counter?: boolean; // muestra contador cuando exista maxLength
  labels?: TextInputLabels;

  "aria-describedby"?: string;
} & NativeInputProps;

type MotionProps = Omit<
  HTMLMotionProps<"input">,
  "onChange" | "value" | "ref"
> & {
  asMotion?: true;
};

export type TextInputProps =
  | (PlainProps & { asMotion?: false })
  | (PlainProps & MotionProps);

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (props, ref) => {
    const {
      label,
      placeholder,
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,

      type = "text",
      disabled = false,
      readOnly = false,
      required = false,

      error,
      success,
      helperText,

      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      prefix,
      suffix,

      size = "md",
      variant = "outlined",
      className = "",
      id,
      name,
      autoComplete,
      autoFocus = false,
      maxLength,
      minLength,
      pattern,

      clearable = false,
      passwordToggle = false,
      counter = false,
      labels,

      asMotion,
      ...rest
    } = props as TextInputProps;

    // Labels sin i18n
    const L: Required<TextInputLabels> = {
      clear: "Clear",
      showPassword: "Show password",
      hidePassword: "Hide password",
      charsRemaining: (n) => `${n} characters left`,
      ...labels,
    };

    // Controlado vs no controlado
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState<string>(
      defaultValue ?? ""
    );
    const currentValue = isControlled ? (value as string) : internalValue;

    const [focused, setFocused] = React.useState(false);
    const [reveal, setReveal] = React.useState(false);

    // IDs accesibles
    const autoId = React.useId();
    const inputId = id ?? `input-${autoId}`;
    const helperTextId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    // Estados
    const hasError = Boolean(error);
    const hasSuccess = Boolean(success) && !hasError;

    // Estilos
    const baseInput =
      "w-full border transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed read-only:bg-gray-50 read-only:cursor-default dark:read-only:bg-gray-800";
    const variants: Record<TextInputVariant, string> = {
      outlined:
        "bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-500 dark:focus:border-blue-400",
      filled:
        "bg-gray-50 border-transparent hover:bg-gray-100 focus:bg-white focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:bg-gray-800 dark:focus:border-blue-400",
    };
    const sizes: Record<TextInputSize, string> = {
      xs: "px-2 py-1 text-xs rounded",
      sm: "px-3 py-1.5 text-sm rounded-md",
      md: "px-4 py-2 text-base rounded-lg",
      lg: "px-5 py-3 text-lg rounded-xl",
      xl: "px-6 py-4 text-xl rounded-2xl",
    };
    const iconSizes: Record<TextInputSize, string> = {
      xs: "w-3 h-3",
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
      xl: "w-7 h-7",
    };

    const safeVariant = variants[variant] ? variant : "outlined";
    const safeSize = sizes[size] ? size : "md";
    const stateClass = hasError
      ? "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-400"
      : hasSuccess
      ? "border-green-500 focus:border-green-500 focus:ring-green-500 dark:border-green-400"
      : "";

    const inputClass = cx(
      baseInput,
      variants[safeVariant],
      sizes[safeSize],
      stateClass,
      (LeftIcon || prefix) && "pl-10",
      (RightIcon ||
        suffix ||
        clearable ||
        (passwordToggle && type === "password")) &&
        "pr-10",
      className
    );

    const labelClass = cx(
      "block text-sm font-medium mb-1",
      hasError
        ? "text-red-700 dark:text-red-400"
        : "text-gray-700 dark:text-gray-300",
      disabled && "opacity-50"
    );

    const helperClass = cx(
      "mt-1 text-sm",
      hasError
        ? "text-red-600 dark:text-red-400"
        : hasSuccess
        ? "text-green-600 dark:text-green-400"
        : "text-gray-500 dark:text-gray-400"
    );

    // Handlers
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalValue(e.target.value);
      onChange?.(e);
    };

    const handleFocus: React.FocusEventHandler<HTMLInputElement> = (e) => {
      setFocused(true);
      onFocus?.(e);
    };
    const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
      setFocused(false);
      onBlur?.(e);
    };

    const clear = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (disabled || readOnly) return;
      if (!isControlled) setInternalValue("");
      // disparar onChange con value vacío para sincronizar formularios controlados
      const ev = Object.create(e, {
        target: { value: "" },
        currentTarget: { value: "" },
      });
      try {
        onChange?.(ev);
      } catch {
        // no-op si el consumidor espera un ChangeEvent real
        const input = document.getElementById(
          inputId
        ) as HTMLInputElement | null;
        if (input) {
          const native = new Event("input", { bubbles: true });
          input.value = "";
          input.dispatchEvent(native);
        }
      }
    };

    const togglePassword = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setReveal((r) => !r);
    };

    // Cálculo de ARIA
    const described =
      [
        props["aria-describedby"],
        helperText ? helperTextId : null,
        error ? errorId : null,
      ]
        .filter(Boolean)
        .join(" ") || undefined;

    const InputTag: any = (props as any).asMotion ? motion.input : "input";
    const rightPaddingSpace =
      clearable ||
      (passwordToggle && type === "password") ||
      RightIcon ||
      suffix;

    // contador (si hay maxLength y se pidió counter)
    const remaining =
      typeof maxLength === "number"
        ? Math.max(0, maxLength - (currentValue?.length ?? 0))
        : undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className={labelClass}>
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {/* Izquierda: icono o prefijo */}
          {(LeftIcon || prefix) && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              {LeftIcon && (
                <LeftIcon
                  className={cx(iconSizes[safeSize], "text-gray-400")}
                  aria-hidden="true"
                />
              )}
              {prefix && (
                <span className="text-gray-500 select-none">{prefix}</span>
              )}
            </div>
          )}

          {/* Campo */}
          <InputTag
            ref={ref as any}
            id={inputId}
            name={name}
            type={
              type === "password" && passwordToggle
                ? reveal
                  ? "text"
                  : "password"
                : type
            }
            value={currentValue}
            defaultValue={defaultValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            maxLength={maxLength}
            minLength={minLength}
            pattern={pattern}
            className={inputClass}
            aria-invalid={hasError}
            aria-describedby={described}
            whileFocus={asMotion ? { scale: 1.01 } : undefined}
            transition={asMotion ? { duration: 0.2 } : undefined}
            {...(rest as any)}
          />

          {/* Derecha: sufijos / icono / acciones */}
          {(RightIcon || suffix || rightPaddingSpace) && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
              {suffix && (
                <span className="text-gray-500 select-none">{suffix}</span>
              )}
              {RightIcon && (
                <RightIcon
                  className={cx(iconSizes[safeSize], "text-gray-400")}
                  aria-hidden="true"
                />
              )}

              {/* Botón mostrar/ocultar password */}
              {type === "password" && passwordToggle && (
                <button
                  type="button"
                  onClick={togglePassword}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={reveal ? L.hidePassword : L.showPassword}
                  tabIndex={disabled ? -1 : 0}
                >
                  <svg
                    className={cx(iconSizes[safeSize])}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    {reveal ? (
                      <path
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2 2l20 20M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-3.42M9.88 5.5A9.53 9.53 0 0112 5c7 0 10 7 10 7a13.28 13.28 0 01-3.24 3.94M6.1 6.1A13.28 13.28 0 002 12s3 7 10 7a9.59 9.59 0 004.61-1.17"
                      />
                    ) : (
                      <>
                        <path
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z"
                        />
                        <circle cx="12" cy="12" r="3" strokeWidth="2" />
                      </>
                    )}
                  </svg>
                </button>
              )}

              {/* Botón limpiar */}
              {clearable && !!currentValue && !readOnly && !disabled && (
                <button
                  type="button"
                  onClick={clear}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={L.clear}
                >
                  <svg
                    className={cx(iconSizes[safeSize])}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 8.586l4.95-4.95 1.414 1.414L11.414 10l4.95 4.95-1.414 1.414L10 11.414l-4.95 4.95-1.414-1.414L8.586 10 3.636 5.05 5.05 3.636 10 8.586z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Línea de estado: helper / error + contador opcional */}
        {(helperText ||
          error ||
          (counter && typeof maxLength === "number")) && (
          <div className="mt-1 flex items-start justify-between gap-2">
            {(helperText || error) && (
              <p
                id={error ? errorId : helperTextId}
                className={helperClass}
                role={error ? "alert" : undefined}
              >
                {error || helperText}
              </p>
            )}
            {counter && typeof maxLength === "number" && (
              <p className="text-xs text-gray-500 dark:text-gray-400 select-none">
                {L.charsRemaining(remaining ?? 0)}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";

export default TextInput;
