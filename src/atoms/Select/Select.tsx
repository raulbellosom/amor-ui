// Select.tsx
import * as React from "react";
import { motion, AnimatePresence } from "motion/react";

export type SelectSize = "xs" | "sm" | "md" | "lg" | "xl";
export type SelectVariant = "outlined" | "filled";

export type SelectOption<V extends string | number = string | number> = {
  value: V;
  label: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ComponentType<
    React.SVGProps<SVGSVGElement> & { className?: string }
  >;
  disabled?: boolean;
};

export type SelectLabels = {
  placeholder?: string; // Texto cuando no hay valor seleccionado
  noOptions?: string; // Texto cuando no hay opciones
  searchPlaceholder?: string; // Placeholder del buscador interno (si searchable)
  clear?: string; // Aria-label del botón de limpiar
};

type NativeButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange" | "value" | "size"
>;

export interface SelectProps<V extends string | number = string | number>
  extends Omit<NativeButtonProps, "onSelect"> {
  label?: React.ReactNode;
  name?: string;
  id?: string;

  value?: V;
  defaultValue?: V;
  onChange?: (nextValue: V | undefined, option?: SelectOption<V>) => void;

  options: Array<SelectOption<V>>;

  disabled?: boolean;
  required?: boolean;
  error?: string;
  success?: boolean;
  helperText?: React.ReactNode;

  size?: SelectSize;
  variant?: SelectVariant;
  className?: string;

  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;

  labels?: SelectLabels;

  /** Máxima altura del dropdown (px, string con unidades, etc.). */
  dropdownMaxHeight?: string | number;

  /** Controla apertura desde fuera si lo necesitas. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  "aria-describedby"?: string;
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (props, ref) => {
    const {
      label,
      name,
      id,
      value,
      defaultValue,
      onChange,
      options,

      disabled = false,
      required = false,
      error,
      success,
      helperText,

      size = "md",
      variant = "outlined",
      className = "",

      searchable = false,
      clearable = false,
      loading = false,

      labels,
      dropdownMaxHeight = 240,

      open,
      onOpenChange,

      "aria-describedby": ariaDescribedBy,
      ...rest
    } = props as SelectProps;

    // Labels por defecto (sin i18n)
    const L: Required<SelectLabels> = {
      placeholder: "Select an option...",
      noOptions: "No options",
      searchPlaceholder: "Search...",
      clear: "Clear selection",
      ...labels,
    };

    // Controlado vs no controlado
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState<
      string | number | undefined
    >(defaultValue);
    const currentValue = (isControlled ? value : internalValue) as
      | string
      | number
      | undefined;

    // Apertura controlada/opcional
    const [isOpenLocal, setIsOpenLocal] = React.useState(false);
    const isOpen = open !== undefined ? open : isOpenLocal;
    const setOpen = (next: boolean) => {
      onOpenChange?.(next);
      if (open === undefined) setIsOpenLocal(next);
    };

    // Estado de teclado/navegación
    const [activeIndex, setActiveIndex] = React.useState<number>(-1);

    // Búsqueda local
    const [query, setQuery] = React.useState("");
    const filteredOptions = React.useMemo(() => {
      if (!searchable || !query.trim()) return options;
      const q = query.toLowerCase();
      return options.filter((opt) => {
        const text =
          (typeof opt.label === "string"
            ? opt.label
            : String((opt as any).label)
          )?.toLowerCase?.() ?? "";
        const desc =
          (typeof opt.description === "string"
            ? opt.description
            : String((opt as any).description)
          )?.toLowerCase?.() ?? "";
        return text.includes(q) || desc.includes(q);
      });
    }, [options, query, searchable]);

    // Seleccionado actual
    const selected = React.useMemo(
      () => options.find((o) => o.value === currentValue),
      [options, currentValue]
    );

    // Refs
    const selectWrapRef = React.useRef<HTMLDivElement | null>(null);
    const listRef = React.useRef<HTMLUListElement | null>(null);
    const optionRefs = React.useRef<Array<HTMLLIElement | null>>([]);

    // Helper para setear ref sin retornar nada (evita error TS2322)
    const setOptionRef = React.useCallback(
      (idx: number) => (el: HTMLLIElement | null) => {
        optionRefs.current[idx] = el;
      },
      []
    );

    // IDs accesibles
    const autoId = React.useId();
    const selectId = id ?? `select-${autoId}`;
    const listboxId = `${selectId}-listbox`;
    const helperId = `${selectId}-helper`;
    const errorId = `${selectId}-error`;

    const hasError = Boolean(error);
    const hasSuccess = Boolean(success) && !hasError;

    // Estilos base
    const baseSelect =
      "relative w-full border transition-all duration-200 ease-in-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants: Record<SelectVariant, string> = {
      outlined:
        "bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-500 dark:focus:border-blue-400",
      filled:
        "bg-gray-50 border-transparent hover:bg-gray-100 focus:bg-white focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:bg-gray-800 dark:focus:border-blue-400",
    };
    const sizes: Record<SelectSize, string> = {
      xs: "px-2 py-1 text-xs rounded",
      sm: "px-3 py-1.5 text-sm rounded-md",
      md: "px-4 py-2 text-base rounded-lg",
      lg: "px-5 py-3 text-lg rounded-xl",
      xl: "px-6 py-4 text-xl rounded-2xl",
    };
    const safeVariant = variants[variant] ? variant : "outlined";
    const safeSize = sizes[size] ? size : "md";
    const stateClass = hasError
      ? "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-400"
      : hasSuccess
      ? "border-green-500 focus:border-green-500 focus:ring-green-500 dark:border-green-400"
      : isOpen
      ? "border-blue-500 ring-2 ring-blue-500 dark:border-blue-400 dark:ring-blue-400"
      : "";

    const selectBtnClass = cx(
      baseSelect,
      variants[safeVariant],
      sizes[safeSize],
      stateClass,
      "text-gray-900 dark:text-white",
      className
    );

    // Apertura/cierre
    const toggle = () => {
      if (disabled) return;
      setOpen(!isOpen);
      setActiveIndex(-1);
    };

    const commitChange = (opt: SelectOption | undefined) => {
      const nextValue = opt?.value as any;
      if (!isControlled) setInternalValue(nextValue);
      onChange?.(nextValue, opt as any);
    };

    const handleSelect = (opt: SelectOption) => {
      if (opt.disabled) return;
      commitChange(opt);
      setOpen(false);
      setActiveIndex(-1);
      // Devolver foco al trigger
      (ref as React.RefObject<HTMLButtonElement>)?.current?.focus?.();
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (
      e
    ) => {
      if (disabled) return;
      if (
        [
          "Enter",
          " ",
          "ArrowDown",
          "ArrowUp",
          "Escape",
          "Home",
          "End",
        ].includes(e.key)
      ) {
        e.preventDefault();
      }

      if (!isOpen && (e.key === "Enter" || e.key === " ")) {
        setOpen(true);
        return;
      }
      if (e.key === "Escape") {
        setOpen(false);
        setActiveIndex(-1);
        return;
      }

      const opts = filteredOptions.filter((o) => !o.disabled);
      if (!opts.length) return;

      if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        setOpen(true);
        setActiveIndex(0);
        return;
      }

      if (e.key === "ArrowDown") {
        setActiveIndex((i) => (i + 1) % opts.length);
      } else if (e.key === "ArrowUp") {
        setActiveIndex((i) => (i <= 0 ? opts.length - 1 : i - 1));
      } else if (e.key === "Home") {
        setActiveIndex(0);
      } else if (e.key === "End") {
        setActiveIndex(opts.length - 1);
      } else if (e.key === "Enter" || e.key === " ") {
        const active = opts[activeIndex];
        if (active) handleSelect(active);
      }
    };

    // Click fuera → cerrar
    React.useEffect(() => {
      const onDoc = (ev: MouseEvent) => {
        if (
          selectWrapRef.current &&
          !selectWrapRef.current.contains(ev.target as Node)
        ) {
          setOpen(false);
          setActiveIndex(-1);
        }
      };
      document.addEventListener("mousedown", onDoc);
      return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    // Scroll al activo
    React.useEffect(() => {
      if (isOpen && activeIndex >= 0 && optionRefs.current[activeIndex]) {
        optionRefs.current[activeIndex]?.scrollIntoView({
          block: "nearest",
        });
      }
    }, [activeIndex, isOpen]);

    // Limpiar selección
    const clearSelection = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (disabled) return;
      commitChange(undefined);
      setQuery("");
    };

    // ARIA
    const described =
      [ariaDescribedBy, helperText ? helperId : null, error ? errorId : null]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className={cx(
              "block text-sm font-medium mb-1",
              hasError
                ? "text-red-700 dark:text-red-400"
                : "text-gray-700 dark:text-gray-300",
              disabled && "opacity-50"
            )}
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <div ref={selectWrapRef} className="relative">
          <button
            ref={ref}
            id={selectId}
            name={name}
            type="button"
            className={selectBtnClass}
            disabled={disabled}
            onClick={toggle}
            onKeyDown={handleKeyDown}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-describedby={described}
            aria-invalid={hasError}
            {...rest}
          >
            <span className="flex items-center justify-between w-full">
              <span className="flex items-center gap-2 min-w-0">
                {selected?.icon && (
                  <selected.icon
                    className="w-5 h-5 text-gray-400 shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span
                  className={cx(
                    "truncate",
                    selected
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                  title={
                    selected
                      ? typeof selected.label === "string"
                        ? selected.label
                        : undefined
                      : L.placeholder
                  }
                >
                  {selected ? selected.label : L.placeholder}
                </span>
              </span>

              <span className="flex items-center gap-1 shrink-0">
                {clearable && selected && !disabled && (
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="mr-1 inline-flex items-center justify-center rounded-full w-6 h-6 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        d="M10 8.586l4.95-4.95 1.414 1.414L11.414 10l4.95 4.95-1.414 1.414L10 11.414l-4.95 4.95-1.414-1.414L8.586 10l-4.95-4.95L5.05 3.636 10 8.586z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}

                <motion.svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </motion.svg>
              </span>
            </span>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className={cx(
                  "absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden"
                )}
              >
                {/* Buscador opcional */}
                {searchable && (
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                    <input
                      autoFocus
                      type="text"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setActiveIndex(0);
                      }}
                      placeholder={L.searchPlaceholder}
                      className={cx(
                        "w-full rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100",
                        "px-3 py-2 text-sm outline-none border border-transparent",
                        "focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      )}
                      aria-label={L.searchPlaceholder}
                    />
                  </div>
                )}

                <ul
                  ref={listRef}
                  id={listboxId}
                  role="listbox"
                  aria-labelledby={selectId}
                  className="py-1 max-h-[--maxh] overflow-auto"
                  style={{
                    ["--maxh" as any]:
                      typeof dropdownMaxHeight === "number"
                        ? `${dropdownMaxHeight}px`
                        : dropdownMaxHeight,
                  }}
                >
                  {!filteredOptions.length && (
                    <li
                      className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 select-none"
                      aria-disabled="true"
                    >
                      {loading ? "Loading..." : L.noOptions}
                    </li>
                  )}

                  {filteredOptions.map((option, index) => {
                    const isSelected = option.value === currentValue;
                    const isActive = index === activeIndex;
                    const Icon = option.icon;

                    return (
                      <li
                        key={`${String(option.value)}-${index}`}
                        ref={setOptionRef(index)}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={option.disabled || undefined}
                        className={cx(
                          "px-4 py-2 cursor-pointer flex items-center gap-2 transition-colors duration-150",
                          option.disabled
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700",
                          isActive && "bg-blue-100 dark:bg-blue-900",
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                            : "text-gray-900 dark:text-white"
                        )}
                        onClick={() => !option.disabled && handleSelect(option)}
                        onMouseEnter={() => setActiveIndex(index)}
                      >
                        {Icon && (
                          <Icon
                            className="w-5 h-5 text-gray-400"
                            aria-hidden="true"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {option.label}
                          </div>
                          {option.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {option.description}
                            </div>
                          )}
                        </div>

                        {isSelected && (
                          <svg
                            className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {(helperText || error) && (
          <p
            id={error ? errorId : helperId}
            className={cx(
              "mt-1 text-sm",
              hasError
                ? "text-red-600 dark:text-red-400"
                : hasSuccess
                ? "text-green-600 dark:text-green-400"
                : "text-gray-500 dark:text-gray-400"
            )}
            role={error ? "alert" : undefined}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
