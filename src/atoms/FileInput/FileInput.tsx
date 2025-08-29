import * as React from "react";
import { motion, type HTMLMotionProps, type MotionStyle } from "motion/react";

/* ====================================================================== */
/* Utils                                                                  */
/* ====================================================================== */
type ClassValue = string | false | null | undefined;
const cx = (...v: ClassValue[]) => v.filter(Boolean).join(" ");

function bytesToHuman(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(1)} GB`;
}

function isImageFile(file: File) {
  return /^image\//.test(file.type);
}

/* ====================================================================== */
/* Tipos                                                                  */
/* ====================================================================== */
export type FileInputSize = "xs" | "sm" | "md" | "lg" | "xl";
export type FileInputVariant = "outlined" | "filled";

export interface FileInputLabels {
  browse?: string; // "Seleccionar"
  replace?: string; // "Reemplazar"
  dropHere?: string; // "Arrastra y suelta los archivos aquí"
  remove?: string; // "Quitar"
  clear?: string; // "Limpiar"
  files?: (n: number) => string; // "3 archivos"
}

export interface FileInputProps
  extends Omit<
    HTMLMotionProps<"div">,
    "children" | "onChange" | "value" | "defaultValue"
  > {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: string;
  success?: boolean;

  /** Controlado / no-controlado */
  value?: File[];
  defaultValue?: File[];
  onFilesChange?: (files: File[]) => void;

  /** Hooks por acción */
  onAdd?: (accepted: File[]) => void;
  onReject?: (rejected: File[], reasons: string[]) => void;
  onRemove?: (file: File, index: number) => void;

  /** Configuración nativa */
  name?: string;
  id?: string;
  multiple?: boolean;
  accept?: string; // "image/*,.pdf"
  capture?: boolean | "user" | "environment";
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;

  /** Reglas */
  maxFiles?: number; // límite de cantidad
  maxSize?: number; // en bytes
  validate?: (file: File) => string | null; // retornar string si invalida

  /** UI */
  size?: FileInputSize;
  variant?: FileInputVariant;
  dropzone?: boolean; // activa área drag & drop
  chips?: boolean; // muestra chips compactos
  showSize?: boolean; // muestra tamaño en lista
  thumbnails?: boolean; // intenta previsualizar imágenes
  clearable?: boolean; // botón para limpiar
  truncate?: boolean;

  /** i18n */
  labels?: FileInputLabels;
}

/* ====================================================================== */
/* Tokens visuales (alineados al TextInput)                                */
/* ====================================================================== */
const variants: Record<FileInputVariant, string> = {
  outlined:
    "bg-white border-gray-300 hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-500 dark:focus-within:border-blue-400",
  filled:
    "bg-gray-50 border-transparent hover:bg-gray-100 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus-within:bg-gray-800 dark:focus-within:border-blue-400",
};

const sizes: Record<FileInputSize, string> = {
  xs: "px-2 py-1 text-xs rounded",
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-4 py-2 text-base rounded-lg",
  lg: "px-5 py-3 text-lg rounded-xl",
  xl: "px-6 py-4 text-xl rounded-2xl",
};

const chipBase =
  "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs bg-muted/70 text-foreground hover:bg-muted";
const removeBtn =
  "inline-grid place-items-center rounded hover:bg-black/10 dark:hover:bg-white/10 w-5 h-5";

/* ====================================================================== */
/* Componente                                                              */
/* ====================================================================== */
export const FileInput = React.forwardRef<HTMLDivElement, FileInputProps>(
  (
    {
      label,
      helperText,
      error,
      success,

      value,
      defaultValue = [],
      onFilesChange,
      onAdd,
      onReject,
      onRemove,

      name,
      id,
      multiple = true,
      accept,
      capture,
      required = false,
      disabled = false,
      readOnly = false,

      maxFiles,
      maxSize,
      validate,

      size = "md",
      variant = "outlined",
      dropzone = true,
      chips = true,
      showSize = true,
      thumbnails = true,
      clearable = true,
      truncate = true,

      labels,

      className,
      style,
      ...motionProps
    },
    ref
  ) => {
    const L: Required<FileInputLabels> = {
      browse: "Seleccionar",
      replace: "Reemplazar",
      dropHere: "Arrastra y suelta los archivos aquí",
      remove: "Quitar",
      clear: "Limpiar",
      files: (n) => `${n} archivo${n === 1 ? "" : "s"}`,
      ...labels,
    };

    const isControlled = value !== undefined;
    const [files, setFiles] = React.useState<File[]>(defaultValue);
    const current = isControlled ? (value as File[]) : files;

    const inputRef = React.useRef<HTMLInputElement>(null);
    const autoId = React.useId();
    const inputId = id ?? `fileinput-${autoId}`;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const hasError = Boolean(error);
    const hasSuccess = Boolean(success) && !hasError;

    const rootCls = cx("w-full", className);

    const boxCls = cx(
      "w-full border transition-all duration-200 ease-in-out focus:outline-none",
      variants[variant],
      sizes[size],
      disabled && "opacity-50 cursor-not-allowed",
      readOnly && "pointer-events-none opacity-75"
    );

    const stateCls = hasError
      ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-500 dark:border-red-400"
      : hasSuccess
      ? "border-green-500 focus-within:border-green-500 focus-within:ring-green-500 dark:border-green-400"
      : "";

    const describedBy =
      [
        (motionProps as any)["aria-describedby"],
        helperText ? helperId : null,
        error ? errorId : null,
      ]
        .filter(Boolean)
        .join(" ") || undefined;

    const openPicker = () => {
      if (disabled || readOnly) return;
      inputRef.current?.click();
    };

    const applyChange = (next: File[]) => {
      if (!isControlled) setFiles(next);
      onFilesChange?.(next);
    };

    const validateFiles = (incoming: File[]) => {
      const accepted: File[] = [];
      const rejected: File[] = [];
      const reasons: string[] = [];

      for (const f of incoming) {
        if (maxSize && f.size > maxSize) {
          rejected.push(f);
          reasons.push(`"${f.name}" excede ${bytesToHuman(maxSize)}`);
          continue;
        }
        if (validate) {
          const res = validate(f);
          if (typeof res === "string" && res) {
            rejected.push(f);
            reasons.push(res);
            continue;
          }
        }
        accepted.push(f);
      }

      return { accepted, rejected, reasons };
    };

    const addFiles = (incoming: File[]) => {
      let next = [...current];

      // respetar maxFiles
      if (typeof maxFiles === "number") {
        const space = Math.max(0, maxFiles - next.length);
        incoming = incoming.slice(0, space);
      }

      const { accepted, rejected, reasons } = validateFiles(incoming);

      if (accepted.length) {
        next = multiple ? [...next, ...accepted] : [accepted[0]];
        applyChange(next);
        onAdd?.(accepted);
      }
      if (rejected.length) {
        onReject?.(rejected, reasons);
      }
    };

    const onInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      const list = Array.from(e.target.files ?? []);
      addFiles(list);
      // Limpia el value del input para permitir re-seleccionar el mismo archivo
      e.currentTarget.value = "";
    };

    // Drag & Drop
    const [dragOver, setDragOver] = React.useState(false);
    const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      if (disabled || readOnly) return;
      const list = Array.from(e.dataTransfer.files ?? []);
      addFiles(list);
    };
    const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
      if (disabled || readOnly) return;
      e.preventDefault();
      e.stopPropagation();
      setDragOver(true);
    };
    const onDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
    };

    const removeAt = (i: number) => {
      const file = current[i];
      const next = current.filter((_, idx) => idx !== i);
      applyChange(next);
      onRemove?.(file, i);
    };

    const clearAll = () => {
      if (!current.length) return;
      applyChange([]);
    };

    // thumbnails
    const [previews, setPreviews] = React.useState<Record<string, string>>({});
    React.useEffect(() => {
      if (!thumbnails) return;
      const need = current.filter(isImageFile);
      const map: Record<string, string> = {};
      need.forEach(
        (f) => (map[f.name + f.size + f.lastModified] = URL.createObjectURL(f))
      );
      setPreviews(map);
      return () => {
        Object.values(map).forEach((url) => URL.revokeObjectURL(url));
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current.length, thumbnails]);

    const showDrop = dropzone && !disabled && !readOnly;

    return (
      <motion.div
        ref={ref}
        className={rootCls}
        style={style as MotionStyle}
        {...motionProps}
      >
        {label && (
          <label
            htmlFor={inputId}
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

        <div
          className={cx(boxCls, stateCls, "relative")}
          aria-describedby={describedBy}
          data-dragover={dragOver ? "" : undefined}
          onDrop={showDrop ? onDrop : undefined}
          onDragOver={showDrop ? onDragOver : undefined}
          onDragLeave={showDrop ? onDragLeave : undefined}
        >
          <input
            ref={inputRef}
            id={inputId}
            name={name}
            type="file"
            className="sr-only"
            multiple={multiple}
            accept={accept}
            capture={capture as any}
            required={required}
            disabled={disabled || readOnly}
            onChange={onInputChange}
            aria-invalid={hasError}
          />

          {/* Zona de interacción */}
          <div className="flex items-center justify-between gap-3">
            <div className={cx("flex-1 min-w-0", truncate && "truncate")}>
              {current.length === 0 ? (
                <span className="text-gray-500 dark:text-gray-400 select-none">
                  {showDrop ? L.dropHere : L.browse}
                </span>
              ) : (
                <span className="text-gray-700 dark:text-gray-200">
                  {L.files(current.length)}
                </span>
              )}
            </div>

            <motion.button
              type="button"
              onClick={openPicker}
              disabled={disabled || readOnly}
              className={cx(
                "inline-flex items-center h-9 px-3 rounded-lg border border-border bg-surface hover:bg-muted/60 transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                sizes[size] && size !== "md" && "h-auto py-1.5"
              )}
              whileTap={disabled || readOnly ? {} : { scale: 0.98 }}
            >
              {current.length ? L.replace : L.browse}
            </motion.button>
          </div>

          {/* Overlay visual al arrastrar */}
          {showDrop && dragOver && (
            <div className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-blue-400 ring-offset-1" />
          )}
        </div>

        {/* Lista / Chips */}
        {current.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {chips ? (
              <div className="flex flex-wrap gap-2">
                {current.map((f, i) => (
                  <div key={f.name + f.size + i} className={chipBase}>
                    {thumbnails &&
                    isImageFile(f) &&
                    previews[f.name + f.size + f.lastModified] ? (
                      <img
                        src={previews[f.name + f.size + f.lastModified]}
                        alt=""
                        className="w-5 h-5 rounded object-cover"
                      />
                    ) : null}
                    <span
                      className={cx("max-w-[14rem]", truncate && "truncate")}
                    >
                      {f.name}
                    </span>
                    {showSize && (
                      <span className="opacity-70">
                        · {bytesToHuman(f.size)}
                      </span>
                    )}
                    <button
                      type="button"
                      className={removeBtn}
                      onClick={() => removeAt(i)}
                      aria-label={`${L.remove}: ${f.name}`}
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 8.586l4.95-4.95 1.414 1.414L11.414 10l4.95 4.95-1.414 1.414L10 11.414l-4.95 4.95-1.414-1.414L8.586 10 3.636 5.05 5.05 3.636 10 8.586z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
                {clearable && (
                  <button
                    type="button"
                    className={cx(
                      chipBase,
                      "bg-transparent border border-border hover:bg-muted/50"
                    )}
                    onClick={clearAll}
                    aria-label={L.clear}
                  >
                    {L.clear}
                  </button>
                )}
              </div>
            ) : (
              <ul className="space-y-1">
                {current.map((f, i) => (
                  <li
                    key={f.name + f.size + i}
                    className="flex items-center gap-2"
                  >
                    {thumbnails &&
                    isImageFile(f) &&
                    previews[f.name + f.size + f.lastModified] ? (
                      <img
                        src={previews[f.name + f.size + f.lastModified]}
                        alt=""
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <span className="inline-grid place-items-center w-8 h-8 rounded bg-muted/70 text-xs">
                        {f.name.split(".").pop()?.slice(0, 3).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className={cx("text-sm", truncate && "truncate")}>
                        {f.name}
                      </div>
                      {showSize && (
                        <div className="text-xs text-muted-foreground">
                          {bytesToHuman(f.size)}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className={cx(removeBtn, "w-7 h-7")}
                      onClick={() => removeAt(i)}
                      aria-label={`${L.remove}: ${f.name}`}
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 8.586l4.95-4.95 1.414 1.414L11.414 10l4.95 4.95-1.414 1.414L10 11.414l-4.95 4.95-1.414-1.414L8.586 10 3.636 5.05 5.05 3.636 10 8.586z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
                {clearable && (
                  <li>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                      onClick={clearAll}
                    >
                      {L.clear}
                    </button>
                  </li>
                )}
              </ul>
            )}
          </div>
        )}

        {/* Línea de estado */}
        {(helperText || error) && (
          <div className="mt-1">
            <p
              id={error ? errorId : helperId}
              className={cx(
                "text-sm",
                error
                  ? "text-red-600 dark:text-red-400"
                  : hasSuccess
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500 dark:text-gray-400"
              )}
              role={error ? "alert" : undefined}
            >
              {error || helperText}
            </p>
          </div>
        )}
      </motion.div>
    );
  }
);

FileInput.displayName = "FileInput";

export default FileInput;
