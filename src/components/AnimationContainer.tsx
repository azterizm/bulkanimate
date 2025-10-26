import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef } from "react";

export interface AnimationContainerProps {
  children: ReactNode;
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
  onRef?: (ref: HTMLDivElement | null) => void;
}

export function AnimationContainer({
  children,
  width = 400,
  height = 200,
  className = "",
  style = {},
  onRef,
}: AnimationContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pass ref to parent component when ref changes
  useEffect(() => {
    if (onRef && containerRef.current) {
      onRef(containerRef.current);
    }
  }, [onRef]);

  const containerStyle: CSSProperties = {
    width,
    height,
    border: "2px solid #333",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
    ...style,
  };

  return (
    <div ref={containerRef} className={className} style={containerStyle}>
      {children}
    </div>
  );
}
