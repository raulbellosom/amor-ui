import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { Minus, Plus } from "lucide-react";

/* =====================
   Tipos y utilidades
===================== */
export type CounterSize = "sm" | "md" | "lg";
export type CounterVariant = "outline" | "ghost" | "brand";

export interface CounterProps
  extends Omit<HTMLMotionProps<"div">, "onChange" | "children"> {
  value?: number;
  defaultValue?: number;
  onChange?: (val: number) => void;

  min?: number;
  max?: number;
  step?: number;

  size?: CounterSize;
  variant?: CounterVariant;
  disabled?: boolean;
  ariaLabel?: string;
}

function useControllableState({
  value,
  defaultValue,
  onChange,
}: {
  value?: number;
  defaultValue: number;
  onChange?: (v: number) => void;
}) {
  const [state, setState] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? (value as number) : state;

  const set = React.useCallback(
    (next: number) => {
      if (!isControlled) setState(next);
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  return [current, set] as const;
}

/* =====================
   Tokens visuales
===================== */
const sizeStyles: Record<CounterSize, string> = {
  sm: "h-8 text-sm rounded-md",
  md: "h-10 text-base rounded-lg",
  lg: "h-12 text-lg rounded-xl",
};

const btnSize: Record<CounterSize, string> = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

const variantStyles: Record<CounterVariant, string> = {
  outline:
    "border border-border bg-transparent text-foreground hover:bg-muted/40",
  ghost: "bg-transparent text-foreground hover:bg-muted/40",
  brand: "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500",
};

/* =====================
   Componente
===================== */
export const Counter = React.forwardRef<HTMLDivElement, CounterProps>(
  (
    {
      value,
      defaultValue = 0,
      onChange,
      min = Number.MIN_SAFE_INTEGER,
      max = Number.MAX_SAFE_INTEGER,
      step = 1,
      size = "md",
      variant = "outline",
      disabled = false,
      className,
      ariaLabel = "Counter",
      ...rest
    },
    ref
  ) => {
    const [count, setCount] = useControllableState({
      value,
      defaultValue,
      onChange,
    });

    const inc = () => {
      if (disabled) return;
      setCount(Math.min(count + step, max));
    };
    const dec = () => {
      if (disabled) return;
      setCount(Math.max(count - step, min));
    };

    const safeSize = sizeStyles[size];
    const btnCls = btnSize[size];

    return (
      <motion.div
        ref={ref}
        className={[
          "inline-flex items-center border rounded-md overflow-hidden select-none",
          safeSize,
          className,
        ].join(" ")}
        role="spinbutton"
        aria-label={ariaLabel}
        aria-valuenow={count}
        aria-valuemin={min}
        aria-valuemax={max}
        {...rest}
      >
        {/* Botón - */}
        <motion.button
          type="button"
          disabled={disabled || count <= min}
          className={[
            "flex items-center justify-center transition-colors",
            btnCls,
            variantStyles[variant],
            "disabled:opacity-40 disabled:cursor-not-allowed",
          ].join(" ")}
          onClick={dec}
          whileTap={disabled ? {} : { scale: 0.9 }}
        >
          <Minus className="w-4 h-4" aria-hidden />
        </motion.button>

        {/* Valor */}
        <div className="flex-1 text-center px-3 font-medium tabular-nums">
          {count}
        </div>

        {/* Botón + */}
        <motion.button
          type="button"
          disabled={disabled || count >= max}
          className={[
            "flex items-center justify-center transition-colors",
            btnCls,
            variantStyles[variant],
            "disabled:opacity-40 disabled:cursor-not-allowed",
          ].join(" ")}
          onClick={inc}
          whileTap={disabled ? {} : { scale: 0.9 }}
        >
          <Plus className="w-4 h-4" aria-hidden />
        </motion.button>
      </motion.div>
    );
  }
);

Counter.displayName = "Counter";

export default Counter;
