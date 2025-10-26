import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef } from "react";

export interface AnimatedElementProps {
  children?: ReactNode;
  width?: number;
  height?: number;
  left?: number;
  top?: number;
  background?: string;
  className?: string;
  style?: CSSProperties;
  animation?: string;
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
  onRef?: (ref: HTMLDivElement | null) => void;
  id?: string;
}

export function AnimatedElement({
  children,
  width = 80,
  height = 80,
  left = 10,
  top = 60,
  background = "#4CAF50",
  className = "",
  style = {},
  animation,
  onAnimationStart,
  onAnimationEnd,
  onRef,
  id,
}: AnimatedElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  // Pass ref to parent component when ref changes
  useEffect(() => {
    if (onRef && elementRef.current) {
      onRef(elementRef.current);
    }
  }, [onRef]);

  const elementStyle: CSSProperties = {
    width,
    height,
    background,
    position: "absolute",
    left,
    top,
    animation,
    ...style,
  };

  return (
    <div
      ref={elementRef}
      className={className}
      style={elementStyle}
      onAnimationStart={onAnimationStart}
      onAnimationEnd={onAnimationEnd}
      id={id}
    >
      {children}
    </div>
  );
}
