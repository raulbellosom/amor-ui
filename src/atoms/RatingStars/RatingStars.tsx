// RatingStars.tsx
import * as React from "react";
import { Star as DefaultStar } from "lucide-react";

type IconType = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { className?: string }
>;

export type RatingSize = "xs" | "sm" | "md" | "lg" | "xl";
export type RatingVariant = "display" | "compact" | "detailed";

export type RatingLabels = {
  reviews?: (count: number) => string; // "(123 reviews)"
  basedOnReviews?: (count: number) => string; // "Based on 123 reviews"
  interactiveLabel?: (rating: number, max: number) => string;
  displayLabel?: (rating: number, max: number) => string;
  setTo?: (value: number) => string; // "Set to 3"
};

export interface RatingStarsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  rating?: number;
  maxRating?: number;
  size?: RatingSize;
  variant?: RatingVariant;
  interactive?: boolean;
  precision?: number;
  reviewCount?: number;
  showValue?: boolean;
  icon?: IconType;
  onChange?: (nextRating: number) => void;
  disabled?: boolean;
  readOnly?: boolean;
  iconClassName?: string;
  starsClassName?: string;
  labels?: RatingLabels;
}

const sizeStyles: Record<RatingSize, string> = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
};

const textSizes: Record<RatingSize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

const variantColors: Record<RatingVariant, string> = {
  display: "text-amber-400",
  compact: "text-amber-400",
  detailed: "text-amber-400",
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export const RatingStars = React.forwardRef<HTMLDivElement, RatingStarsProps>(
  (
    {
      rating = 0,
      maxRating = 5,
      size = "md",
      variant = "display",
      interactive = false,
      precision = 1,
      reviewCount,
      showValue = false,
      icon: StarIcon = DefaultStar,
      onChange,
      disabled = false,
      readOnly = false,
      className,
      iconClassName,
      starsClassName,
      labels,
      ...props
    },
    ref
  ) => {
    const L: Required<RatingLabels> = {
      reviews: (c) => `${c} reviews`,
      basedOnReviews: (c) => `Based on ${c} reviews`,
      interactiveLabel: (r, m) => `Rating: ${r} of ${m} (interactive)`,
      displayLabel: (r, m) => `Rating: ${r} of ${m}`,
      setTo: (v) => `Set to ${v}`,
      ...labels,
    };

    const safeSize: RatingSize = sizeStyles[size] ? size : "md";
    const starSize = sizeStyles[safeSize];
    const textSize = textSizes[safeSize];
    const isInteractive = interactive && !readOnly && !disabled;

    const clamp = React.useCallback(
      (n: number) => Math.max(0, Math.min(maxRating, n)),
      [maxRating]
    );
    const roundTo = React.useCallback(
      (n: number) => Math.round(n / precision) * precision,
      [precision]
    );

    const clamped = clamp(rating);
    const rounded = roundTo(clamped);

    const ariaLabel = isInteractive
      ? L.interactiveLabel(rounded, maxRating)
      : L.displayLabel(rounded, maxRating);

    const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
      if (!isInteractive || !onChange) return;
      if (
        [
          "ArrowLeft",
          "ArrowDown",
          "ArrowRight",
          "ArrowUp",
          "PageDown",
          "PageUp",
          "Home",
          "End",
        ].includes(e.key)
      ) {
        e.preventDefault();
      }
      const step = precision;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        onChange(clamp(roundTo(rounded - step)));
      } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        onChange(clamp(roundTo(rounded + step)));
      } else if (e.key === "PageDown") {
        onChange(clamp(roundTo(rounded - 5 * step)));
      } else if (e.key === "PageUp") {
        onChange(clamp(roundTo(rounded + 5 * step)));
      } else if (e.key === "Home") {
        onChange(0);
      } else if (e.key === "End") {
        onChange(maxRating);
      }
    };

    const handleStarClick = (index: number) => {
      if (!isInteractive || !onChange) return;
      const next = clamp(roundTo(index + 1));
      onChange(next);
    };

    const renderStar = (index: number) => {
      const fill = Math.max(0, Math.min(1, rounded - index));
      const isFilled = fill > 0;
      const isPartial = fill > 0 && fill < 1;

      return (
        <div
          key={index}
          className={cx(
            "relative inline-block",
            isInteractive && "cursor-pointer"
          )}
          onClick={() => handleStarClick(index)}
          role={isInteractive ? "button" : undefined}
          tabIndex={isInteractive ? -1 : undefined}
          aria-label={isInteractive ? L.setTo(index + 1) : undefined}
        >
          <StarIcon
            className={cx(
              starSize,
              isInteractive
                ? "text-gray-300 hover:text-amber-400 transition-colors duration-150"
                : variantColors[variant],
              iconClassName
            )}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            aria-hidden="true"
          />
          {isFilled && (
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
              aria-hidden="true"
            >
              <StarIcon
                className={cx(starSize, "text-amber-400", iconClassName)}
                fill="currentColor"
                stroke="currentColor"
                strokeWidth={1.6}
              />
            </div>
          )}
          {isPartial && (
            <StarIcon
              className={cx(starSize, "absolute inset-0 pointer-events-none")}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              aria-hidden="true"
            />
          )}
        </div>
      );
    };

    const formatValue = (n: number) => {
      if (precision >= 1) return Math.round(n).toString();
      if (precision >= 0.1) return n.toFixed(1);
      return n.toFixed(2);
    };

    const StarsRow = (
      <div className={cx("flex items-center", starsClassName)}>
        {Array.from({ length: maxRating }, (_, i) => renderStar(i))}
      </div>
    );

    const ValueAndCount =
      showValue || reviewCount !== undefined ? (
        <div className="flex items-center gap-1">
          {showValue && (
            <span
              className={cx(
                textSize,
                "font-medium text-gray-700 dark:text-gray-300"
              )}
            >
              {formatValue(rounded)}
            </span>
          )}
          {reviewCount !== undefined && (
            <span className={cx(textSize, "text-gray-500 dark:text-gray-400")}>
              ({L.reviews(reviewCount)})
            </span>
          )}
        </div>
      ) : null;

    let content: React.ReactNode;
    switch (variant) {
      case "compact":
        content = (
          <div className={cx("flex items-center gap-1", className)} {...props}>
            {StarsRow}
            {ValueAndCount}
          </div>
        );
        break;
      case "detailed":
        content = (
          <div className={cx("flex flex-col gap-1", className)} {...props}>
            <div className="flex items-center gap-2">
              {StarsRow}
              <span
                className={cx(
                  textSize,
                  "font-semibold text-gray-900 dark:text-gray-100"
                )}
              >
                {formatValue(rounded)}
              </span>
            </div>
            {reviewCount !== undefined && (
              <p
                className={cx(textSizes.sm, "text-gray-500 dark:text-gray-400")}
              >
                {L.basedOnReviews(reviewCount)}
              </p>
            )}
          </div>
        );
        break;
      default:
        content = (
          <div className={cx("flex items-center gap-1", className)} {...props}>
            {StarsRow}
            {ValueAndCount}
          </div>
        );
    }

    return (
      <div
        ref={ref}
        role={isInteractive ? "slider" : "img"}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        aria-readonly={readOnly || undefined}
        aria-valuemin={isInteractive ? 0 : undefined}
        aria-valuemax={isInteractive ? maxRating : undefined}
        aria-valuenow={isInteractive ? rounded : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onKeyDown={handleKeyDown}
      >
        {content}
      </div>
    );
  }
);

RatingStars.displayName = "RatingStars";

export default RatingStars;
