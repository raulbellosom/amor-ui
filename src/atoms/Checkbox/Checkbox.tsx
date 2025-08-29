// Checkbox.tsx
import * as React from "react";
import { Check, Minus } from "lucide-react";

export type CheckboxSize = "sm" | "md" | "lg";
export type CheckboxVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";

type NativeInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "onChange" | "checked" | "defaultChecked"
>;

export interface CheckboxProps extends NativeInputProps {
  id?: string;
  name?: string;
  checked?: boolean;
  /** Si está en true y checked=false, el input se marcará `indeterminate` en el DOM */
  indeterminate?: boolean;
  disabled?: boolean;
  size?: CheckboxSize;
  variant?: CheckboxVariant;
  /** Texto o nodo clickable que asocia el label al input */
  label?: React.ReactNode;
  /** Texto pequeño de apoyo (se enlaza vía aria-describedby) */
  description?: React.ReactNode;
  /** Muestra mensaje de error y estilos en rojo */
  error?: string;
  className?: string;
  /** onChange con la firma que usas en tu UI-kit */
  onChange?: (
    nextChecked: boolean,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

const sizeStyles: Record<
  CheckboxSize,
  { box: string; icon: string; errorMargin: string }
> = {
  sm: { box: "w-4 h-4", icon: "w-3 h-3", errorMargin: "ml-6" },
  md: { box: "w-5 h-5", icon: "w-3.5 h-3.5", errorMargin: "ml-7" },
  lg: { box: "w-6 h-6", icon: "w-4 h-4", errorMargin: "ml-8" },
};

const variantStyles: Record<
  CheckboxVariant,
  { base: string; checked: string; focus: string }
> = {
  primary: {
    base: "border-gray-300 dark:border-gray-600",
    checked: "bg-blue-600 border-blue-600",
    focus: "ring-blue-500/20 dark:ring-blue-400/20",
  },
  secondary: {
    base: "border-gray-300 dark:border-gray-600",
    checked: "bg-gray-500 border-gray-500",
    focus: "ring-gray-500/20 dark:ring-gray-400/20",
  },
  success: {
    base: "border-gray-300 dark:border-gray-600",
    checked: "bg-green-600 border-green-600",
    focus: "ring-green-500/20 dark:ring-green-400/20",
  },
  warning: {
    base: "border-gray-300 dark:border-gray-600",
    checked: "bg-amber-500 border-amber-500",
    focus: "ring-amber-500/20 dark:ring-amber-400/20",
  },
  danger: {
    base: "border-gray-300 dark:border-gray-600",
    checked: "bg-red-600 border-red-600",
    focus: "ring-red-500/20 dark:ring-red-400/20",
  },
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      id,
      name,
      checked = false,
      indeterminate = false,
      disabled = false,
      size = "md",
      variant = "primary",
      label,
      description,
      error,
      className = "",
      onChange,
      ...props
    },
    ref
  ) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;

    // Mantén una ref interna para setear `indeterminate` en el DOM
    const innerRef = React.useRef<HTMLInputElement | null>(null);

    // Exponer ref externa + mantener interna
    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    // Actualiza propiedad DOM indeterminate cuando cambie
    React.useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = !!indeterminate && !checked;
      }
    }, [indeterminate, checked]);

    const s = sizeStyles[size] ?? sizeStyles.md;
    const v = variantStyles[variant] ?? variantStyles.primary;

    const boxClass = cx(
      "relative inline-flex items-center justify-center rounded",
      "border-2 transition-colors duration-150",
      "peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2",
      "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
      s.box,
      checked || (indeterminate && !checked) ? v.checked : v.base,
      `peer-focus-visible:${v.focus}`,
      error && "border-red-500 dark:border-red-400",
      className
    );

    const labelTextClass = cx(
      "text-sm font-medium cursor-pointer",
      disabled && "opacity-50 cursor-not-allowed",
      error
        ? "text-red-600 dark:text-red-400"
        : "text-gray-700 dark:text-gray-300"
    );

    // Accesibilidad
    const descriptionId = description ? `${inputId}-desc` : undefined;
    const errorId = error ? `${inputId}-err` : undefined;
    const ariaDescribedBy =
      [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      onChange?.(e.target.checked, e);
    };

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-start gap-2">
          <div className="relative">
            <input
              ref={innerRef}
              type="checkbox"
              id={inputId}
              name={name ?? inputId}
              checked={checked}
              disabled={disabled}
              onChange={handleChange}
              className="peer sr-only"
              role="checkbox"
              aria-checked={indeterminate ? "mixed" : !!checked}
              aria-invalid={!!error}
              aria-describedby={ariaDescribedBy}
              {...props}
            />
            <label htmlFor={inputId} className={boxClass}>
              {(checked || (indeterminate && !checked)) && (
                <span className="text-white dark:text-gray-900">
                  {indeterminate && !checked ? (
                    <Minus className={s.icon} aria-hidden="true" />
                  ) : (
                    <Check className={s.icon} aria-hidden="true" />
                  )}
                </span>
              )}
            </label>
          </div>

          {(label || description) && (
            <div className="flex-1">
              {label && (
                <label htmlFor={inputId} className={labelTextClass}>
                  {label}
                </label>
              )}
              {description && (
                <p
                  id={descriptionId}
                  className="text-xs text-gray-500 dark:text-gray-400 mt-0.5"
                >
                  {description}
                </p>
              )}
            </div>
          )}
        </div>

        {error && (
          <p
            id={errorId}
            className={cx(
              "text-xs text-red-600 dark:text-red-400",
              s.errorMargin
            )}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
