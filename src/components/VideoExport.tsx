import type { AnchorHTMLAttributes } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";

export interface VideoExportProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  videoUrl?: string;
  filename?: string;
  onExportComplete?: (url: string, filename: string) => void;
  children?: React.ReactNode;
  variant?: "link" | "button";
  buttonVariant?: "primary" | "secondary";
}

export const VideoExport = forwardRef<HTMLAnchorElement, VideoExportProps>(
  (
    {
      videoUrl,
      filename = "capture.webm",
      onExportComplete,
      children = "Download",
      variant = "link",
      buttonVariant = "primary",
      style,
      ...props
    },
    ref,
  ) => {
    const anchorRef = useRef<HTMLAnchorElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Combine refs
    const setRefs = (element: HTMLAnchorElement | null) => {
      anchorRef.current = element;
      if (typeof ref === "function") {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    useEffect(() => {
      if (videoUrl && anchorRef.current) {
        anchorRef.current.href = videoUrl;
        anchorRef.current.download = filename;
        anchorRef.current.style.display =
          variant === "button" ? "inline-block" : "inline";
        onExportComplete?.(videoUrl, filename);
      }
    }, [videoUrl, filename, onExportComplete, variant]);

    const baseStyles = {
      textDecoration: variant === "link" ? "underline" : "none",
      cursor: "pointer",
    };

    const buttonStyles =
      variant === "button"
        ? {
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "bold",
            borderRadius: "6px",
            border: "none",
            transition: "all 0.2s ease-in-out",
            backgroundColor:
              buttonVariant === "primary"
                ? isHovered
                  ? "#218838"
                  : "#28a745"
                : isHovered
                  ? "#545b62"
                  : "#6c757d",
            color: "white",
            cursor: "pointer",
            boxShadow: isHovered
              ? "0 4px 8px rgba(0,0,0,0.15)"
              : "0 2px 4px rgba(0,0,0,0.1)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            transform: isHovered ? "translateY(-1px)" : "translateY(0)",
          }
        : {};

    const finalStyle = {
      ...baseStyles,
      ...buttonStyles,
      ...style,
      display: videoUrl
        ? variant === "button"
          ? "inline-flex"
          : "inline"
        : "none",
    };

    return (
      <a
        ref={setRefs}
        style={finalStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {children}
      </a>
    );
  },
);

VideoExport.displayName = "VideoExport";
