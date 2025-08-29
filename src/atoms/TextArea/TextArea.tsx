// TextArea.tsx
import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";

export type TextAreaSize = "xs" | "sm" | "md" | "lg" | "xl";
export type TextAreaVariant = "outlined" | "filled";
export type TextAreaResize = "none" | "vertical" | "horizontal" | "both";

export type TextAreaLabels = {
  clear?: string; // "Clear"
  charsRemaining?: (n: number) => string; // "12 characters left"
};

type NativeTextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  | "onChange"
  | "value"
  | "defaultValue"
  | "rows"
  | "cols"
  | "required"
  | "id"
  | "name"
  | "children"
>;

type BaseProps = {
  label?: React.ReactNode;
  placeholder?: string;

  /** Controlado / no controlado */
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;

  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;

  error?: string;
  success?: boolean;
  helperText?: React.ReactNode;

  size?: TextAreaSize;
  variant?: TextAreaVariant;
  className?: string;
  id?: string;
  name?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  maxLength?: number;
  minLength?: number;

  /** Extras */
  clearable?: boolean;
  counter?: boolean; // muestra contador si hay maxLength
  labels?: TextAreaLabels;

  /** Auto-resize por filas */
  autoResize?: boolean;
  minRows?: number; // por defecto depende del tamaño
  maxRows?: number; // opcional

  /** CSS 'resize' controlado */
  resize?: TextAreaResize;

  "aria-describedby"?: string;
} & NativeTextareaProps;

type MotionProps = Omit<
  HTMLMotionProps<"textarea">,
  "onChange" | "value" | "ref"
> & {
  asMotion?: true;
};

export type TextAreaProps =
  | (BaseProps & { asMotion?: false })
  | (BaseProps & MotionProps);

function cx(...p: Array<string | false | null | undefined>) {
  return p.filter(Boolean).join(" ");
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (props, ref) => {
    const {
      label,
      placeholder,
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,

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
      maxLength,
      minLength,

      clearable = false,
      counter = false,
      labels,

      autoResize = true,
      minRows,
      maxRows,
      resize = "vertical",

      asMotion,
      ...rest
    } = props as TextAreaProps;

    // Labels sin i18n
    const L: Required<TextAreaLabels> = {
      clear: "Clear",
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

    // IDs accesibles
    const autoId = React.useId();
    const areaId = id ?? `textarea-${autoId}`;
    const helperId = `${areaId}-helper`;
    const errorId = `${areaId}-error`;

    // Estados
    const hasError = Boolean(error);
    const hasSuccess = Boolean(success) && !hasError;

    // Estilos base/variantes/tamaños (alineado a TextInput)
    const variants: Record<TextAreaVariant, string> = {
      outlined:
        "bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-500 dark:focus:border-blue-400",
      filled:
        "bg-gray-50 border-transparent hover:bg-gray-100 focus:bg-white focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:bg-gray-800 dark:focus:border-blue-400",
    };
    const sizes: Record<
      TextAreaSize,
      { field: string; radius: string; pad: string; defaultRows: number }
    > = {
      xs: {
        field: "text-xs",
        radius: "rounded",
        pad: "px-2 py-1.5",
        defaultRows: 2,
      },
      sm: {
        field: "text-sm",
        radius: "rounded-md",
        pad: "px-3 py-2",
        defaultRows: 3,
      },
      md: {
        field: "text-base",
        radius: "rounded-lg",
        pad: "px-4 py-3",
        defaultRows: 4,
      },
      lg: {
        field: "text-lg",
        radius: "rounded-xl",
        pad: "px-5 py-4",
        defaultRows: 5,
      },
      xl: {
        field: "text-xl",
        radius: "rounded-2xl",
        pad: "px-6 py-5",
        defaultRows: 6,
      },
    };
    const safeVariant = variants[variant] ? variant : "outlined";
    const s = sizes[size] ?? sizes.md;
    const stateClass = hasError
      ? "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-400"
      : hasSuccess
      ? "border-green-500 focus:border-green-500 focus:ring-green-500 dark:border-green-400"
      : "";

    const baseField =
      "w-full border transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed read-only:bg-gray-50 dark:read-only:bg-gray-800";
    const textareaClass = cx(
      baseField,
      variants[safeVariant],
      s.field,
      s.radius,
      s.pad,
      stateClass,
      resize === "none"
        ? "resize-none"
        : resize === "horizontal"
        ? "resize-x"
        : resize === "both"
        ? "resize"
        : "resize-y",
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

    // --- Auto-resize ---
    const taRef = React.useRef<HTMLTextAreaElement | null>(null);
    React.useImperativeHandle(ref, () => taRef.current as HTMLTextAreaElement);

    const computeRows = React.useCallback(() => {
      const node = taRef.current;
      if (!node) return;

      // resetear altura para medir scrollHeight real
      node.style.height = "auto";
      const lineHeight = getLineHeight(node) || 20; // fallback
      const contentRows = Math.ceil(node.scrollHeight / lineHeight);

      const minR = minRows ?? s.defaultRows;
      const maxR = maxRows ?? Number.POSITIVE_INFINITY;

      const rows = Math.max(minR, Math.min(maxR, contentRows));
      node.rows = rows;
    }, [minRows, maxRows, s.defaultRows]);

    React.useEffect(() => {
      if (!autoResize) return;
      computeRows();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoResize, currentValue]);

    // util para lineHeight
    function getLineHeight(el: HTMLElement) {
      const cs = window.getComputedStyle?.(el);
      const lh = cs?.lineHeight;
      if (!lh) return undefined;
      if (lh.endsWith("px")) return parseFloat(lh);
      // valores como "normal": aproximar a font-size * 1.2
      const fs = cs?.fontSize?.endsWith("px") ? parseFloat(cs.fontSize) : 16;
      return fs * 1.2;
    }

    // Handlers
    const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
      if (!isControlled) setInternalValue(e.target.value);
      onChange?.(e);
      if (autoResize) {
        // defer para que value se aplique y luego medir
        requestAnimationFrame(() => computeRows());
      }
    };

    const handleFocus: React.FocusEventHandler<HTMLTextAreaElement> = (e) => {
      setFocused(true);
      onFocus?.(e);
    };
    const handleBlur: React.FocusEventHandler<HTMLTextAreaElement> = (e) => {
      setFocused(false);
      onBlur?.(e);
    };

    // Limpiar
    const clear = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (disabled || readOnly) return;
      if (!isControlled) setInternalValue("");
      // intenta notificar al consumidor
      try {
        const ev = new Event("input", { bubbles: true });
        taRef.current && (taRef.current.value = "");
        taRef.current?.dispatchEvent(ev);
      } catch {
        /* no-op */
      }
    };

    // ARIA
    const described =
      [
        props["aria-describedby"],
        helperText ? helperId : null,
        error ? errorId : null,
      ]
        .filter(Boolean)
        .join(" ") || undefined;

    const TextareaTag: any = asMotion ? motion.textarea : "textarea";

    const remaining =
      typeof maxLength === "number"
        ? Math.max(0, maxLength - (currentValue?.length ?? 0))
        : undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={areaId} className={labelClass}>
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          <TextareaTag
            ref={taRef as any}
            id={areaId}
            name={name}
            placeholder={placeholder}
            value={currentValue}
            defaultValue={defaultValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            maxLength={maxLength}
            minLength={minLength}
            rows={
              autoResize ? minRows ?? s.defaultRows : minRows ?? s.defaultRows
            }
            className={textareaClass}
            aria-invalid={hasError}
            aria-describedby={described}
            {...(asMotion
              ? {
                  whileFocus: { scale: 1.01 },
                  transition: { duration: 0.2 },
                }
              : {})}
            {...(rest as any)}
          />

          {/* Botón limpiar */}
          {clearable && !!currentValue && !readOnly && !disabled && (
            <button
              type="button"
              onClick={clear}
              className="absolute right-2 top-2 inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={L.clear}
            >
              <svg
                className="w-4 h-4"
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

        {/* Línea inferior: helper/error + contador */}
        {(helperText ||
          error ||
          (counter && typeof maxLength === "number")) && (
          <div className="mt-1 flex items-start justify-between gap-2">
            {(helperText || error) && (
              <p
                id={error ? errorId : helperId}
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

TextArea.displayName = "TextArea";

export default TextArea;
