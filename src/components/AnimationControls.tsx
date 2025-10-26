import type { ButtonHTMLAttributes } from "react";
import { forwardRef, useState } from "react";

export interface AnimationControlsProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  onStartAnimation?: () => void;
  children?: React.ReactNode;
  variant?: "primary" | "secondary";
}

export const AnimationControls = forwardRef<
  HTMLButtonElement,
  AnimationControlsProps
>(
  (
    {
      onStartAnimation,
      children = "Start animation & record",
      variant = "primary",
      onClick,
      ...props
    },
    ref,
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onStartAnimation?.();
      onClick?.(e);
    };

    const [isHovered, setIsHovered] = useState(false);

    const baseStyles = {
      padding: "12px 24px",
      fontSize: "16px",
      fontWeight: "bold",
      borderRadius: "6px",
      cursor: props.disabled ? "not-allowed" : "pointer",
      border: "none",
      transition: "all 0.2s ease-in-out",
      boxShadow:
        isHovered && !props.disabled
          ? "0 4px 8px rgba(0,0,0,0.15)"
          : "0 2px 4px rgba(0,0,0,0.1)",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      transform:
        isHovered && !props.disabled ? "translateY(-1px)" : "translateY(0)",
    };

    const variantStyles =
      variant === "primary"
        ? {
            backgroundColor:
              isHovered && !props.disabled
                ? "#0056b3"
                : props.disabled
                  ? "#6c757d"
                  : "#007bff",
            color: "white",
          }
        : {
            backgroundColor:
              isHovered && !props.disabled ? "#545b62" : "#6c757d",
            color: "white",
          };

    const style = { ...baseStyles, ...variantStyles, ...props.style };

    return (
      <button
        ref={ref}
        onClick={handleClick}
        style={style}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

AnimationControls.displayName = "AnimationControls";
