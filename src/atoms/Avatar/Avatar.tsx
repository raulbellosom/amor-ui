import * as React from "react";
import { motion } from "motion/react";

// Tipos de tamaño, variantes y estatus
export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type AvatarVariant = "circular" | "rounded" | "square";
export type AvatarStatus = "online" | "offline" | "away" | "busy";

// Usa el tipo de props del motion.div para evitar colisiones
type DivMotionProps = React.ComponentProps<typeof motion.div>;

export interface AvatarProps extends Omit<DivMotionProps, "children" | "ref"> {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  variant?: AvatarVariant;
  status?: AvatarStatus;
  /** Clase extra aplicada al contenedor interno (círculo/cuadro) */
  innerClassName?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: "w-6 h-6 text-[10px] leading-none",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
  "2xl": "w-20 h-20 text-xl",
};

const variantStyles: Record<AvatarVariant, string> = {
  circular: "rounded-full",
  rounded: "rounded-lg",
  square: "rounded-none",
};

const statusStyles: Record<AvatarStatus, string> = {
  online: "bg-green-400 border-2 border-white dark:border-gray-800",
  offline: "bg-gray-400 border-2 border-white dark:border-gray-800",
  away: "bg-yellow-400 border-2 border-white dark:border-gray-800",
  busy: "bg-red-400 border-2 border-white dark:border-gray-800",
};

const statusSizes: Record<AvatarSize, string> = {
  xs: "w-2 h-2",
  sm: "w-2.5 h-2.5",
  md: "w-3 h-3",
  lg: "w-3.5 h-3.5",
  xl: "w-4 h-4",
  "2xl": "w-5 h-5",
};

function getInitials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt,
      name,
      size = "md",
      variant = "circular",
      status,
      className = "",
      innerClassName = "",
      onClick,
      ...rest
    },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageLoaded, setImageLoaded] = React.useState(false);

    const safeSize: AvatarSize = sizeStyles[size] ? size : "md";
    const safeVariant: AvatarVariant = variantStyles[variant]
      ? variant
      : "circular";

    const isInteractive = typeof onClick === "function";

    const baseContainer = "relative inline-block align-middle select-none";

    const baseInner = [
      "relative inline-flex items-center justify-center overflow-hidden",
      "bg-gray-100 text-gray-600 font-medium",
      "dark:bg-gray-800 dark:text-gray-300",
      "transition-all duration-200 ease-in-out",
      isInteractive
        ? "cursor-pointer hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        : "",
      sizeStyles[safeSize],
      variantStyles[safeVariant],
      innerClassName,
      className,
    ].join(" ");

    const showImage = !!src && !imageError && imageLoaded;
    const showInitials = !src || imageError || !imageLoaded;

    // Accesibilidad si es interactivo
    const a11yProps = isInteractive
      ? {
          tabIndex: 0,
          role: "button" as const,
          onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
            }
          },
        }
      : {};

    return (
      <div className={baseContainer}>
        <motion.div
          ref={ref}
          className={baseInner}
          onClick={onClick}
          aria-label={alt || (name ? `Avatar for ${name}` : "Avatar")}
          {...a11yProps}
          {...rest}
        >
          {src && (
            <img
              src={src}
              alt={alt || name || "Avatar"}
              className={[
                "w-full h-full object-cover transition-opacity duration-200",
                variantStyles[safeVariant],
                showImage ? "opacity-100" : "opacity-0",
              ].join(" ")}
              onError={() => setImageError(true)}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
          )}

          {showInitials && (
            <span
              className={[
                "absolute inset-0 flex items-center justify-center",
                "transition-opacity duration-200",
                showImage ? "opacity-0" : "opacity-100",
              ].join(" ")}
            >
              {getInitials(name)}
            </span>
          )}

          {src && !imageLoaded && !imageError && (
            <div className="absolute inset-0 grid place-items-center">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            </div>
          )}
        </motion.div>

        {status && (
          <span
            className={[
              "absolute bottom-0 right-0 block rounded-full",
              statusStyles[status],
              statusSizes[safeSize],
            ].join(" ")}
            aria-hidden="true"
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";
