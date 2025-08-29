import * as React from "react";

export type ToggleSize = "sm" | "md" | "lg";
export type ToggleVariant = "primary" | "success" | "warning" | "danger";

export interface ToggleProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "onChange" | "checked" | "size"
  > {
  id?: string;
  name?: string;
  checked?: boolean;
  disabled?: boolean;
  size?: ToggleSize; // <- tu size semántico
  variant?: ToggleVariant;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string | boolean;
  className?: string;
  onChange?: (
    nextChecked: boolean,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      id,
      name,
      checked = false,
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

    const sizeStyles: Record<
      ToggleSize,
      { track: string; thumb: string; translate: string; thumbOffX: string }
    > = {
      sm: {
        track: "w-8 h-4",
        thumb: "w-3 h-3",
        translate: "translate-x-4",
        thumbOffX: "translate-x-[2px]",
      },
      md: {
        track: "w-10 h-5",
        thumb: "w-4 h-4",
        translate: "translate-x-5",
        thumbOffX: "translate-x-[2px]",
      },
      lg: {
        track: "w-12 h-6",
        thumb: "w-5 h-5",
        translate: "translate-x-6",
        thumbOffX: "translate-x-[3px]",
      },
    };

    const variantStyles: Record<
      ToggleVariant,
      { off: string; on: string; focus: string }
    > = {
      primary: {
        off: "bg-gray-200 dark:bg-gray-700",
        on: "bg-brand-500 dark:bg-brand-600",
        focus: "ring-brand-500/20 dark:ring-brand-400/20",
      },
      success: {
        off: "bg-gray-200 dark:bg-gray-700",
        on: "bg-green-500 dark:bg-green-600",
        focus: "ring-green-500/20 dark:ring-green-400/20",
      },
      warning: {
        off: "bg-gray-200 dark:bg-gray-700",
        on: "bg-amber-500 dark:bg-amber-600",
        focus: "ring-amber-500/20 dark:ring-amber-400/20",
      },
      danger: {
        off: "bg-gray-200 dark:bg-gray-700",
        on: "bg-red-500 dark:bg-red-600",
        focus: "ring-red-500/20 dark:ring-red-400/20",
      },
    };

    const SZ = sizeStyles[size] ?? sizeStyles.md;
    const VAR = variantStyles[variant] ?? variantStyles.primary;

    const trackClass = [
      "relative inline-flex items-center rounded-full transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "cursor-pointer",
      SZ.track,
      checked ? VAR.on : VAR.off,
      `focus:${VAR.focus}`,
      error ? "ring-2 ring-red-500/20 dark:ring-red-400/20" : null,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const thumbClass = [
      "inline-block rounded-full bg-white shadow-md transition-transform duration-200 will-change-transform",
      SZ.thumb,
      checked ? SZ.translate : SZ.thumbOffX,
    ]
      .filter(Boolean)
      .join(" ");

    const labelClass = [
      "text-sm font-medium cursor-pointer",
      disabled ? "opacity-50 cursor-not-allowed" : null,
      error
        ? "text-red-600 dark:text-red-400"
        : "text-gray-700 dark:text-gray-300",
    ]
      .filter(Boolean)
      .join(" ");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      onChange?.(e.target.checked, e);
    };

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-start gap-3">
          <div className="relative">
            <input
              ref={ref}
              type="checkbox"
              id={inputId}
              name={name ?? inputId}
              checked={checked}
              disabled={disabled}
              onChange={handleChange}
              className="sr-only"
              role="switch"
              aria-checked={checked}
              aria-invalid={!!error || undefined}
              aria-describedby={description ? `${inputId}-desc` : undefined}
              {...props}
            />
            <label htmlFor={inputId} className={trackClass} aria-hidden>
              <span className={thumbClass} />
            </label>
          </div>

          {(label || description) && (
            <div className="flex-1">
              {label && (
                <label htmlFor={inputId} className={labelClass}>
                  {label}
                </label>
              )}
              {description && (
                <p
                  id={`${inputId}-desc`}
                  className="text-xs text-gray-500 dark:text-gray-400 mt-0.5"
                >
                  {description}
                </p>
              )}
            </div>
          )}
        </div>

        {error && typeof error === "string" ? (
          <p className="text-xs text-red-600 dark:text-red-400 ml-12">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

Toggle.displayName = "Toggle";
export default Toggle;
