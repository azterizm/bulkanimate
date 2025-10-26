import { useRef, useState } from "react";
import {
  AnimatedElement,
  AnimationContainer,
  AnimationControls,
  VideoExport,
} from "../components";
import { useAnimationRecorder } from "../hooks";

export function MultiAnimationDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animatedElementRef = useRef<HTMLDivElement>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [animationType, setAnimationType] = useState<string>("panX");

  const { startRecording, stopRecording, exportVideo } = useAnimationRecorder({
    onRecordingStart: () => {
      setIsRecording(true);
      console.log("Recording started");
    },
    onRecordingStop: () => {
      setIsRecording(false);
      console.log("Recording stopped");
    },
    onExportComplete: (url) => {
      setVideoUrl(url);
    },
    onExportError: (error) => {
      console.error("Recording error:", error);
    },
  });

  const animations = {
    panX: "panX 2000ms linear 1 forwards",
    panY: "panY 2000ms linear 1 forwards",
    zoomIn: "zoomIn 2000ms ease-in-out 1 forwards",
    zoomOut: "zoomOut 2000ms ease-in-out 1 forwards",
    rotate: "rotate 2000ms linear 1 forwards",
    fade: "fade 2000ms ease-in-out 1 forwards",
    bounce: "bounce 2000ms ease-in-out 1 forwards",
  };

  const animationDescriptions = {
    panX: "Pan horizontally across the screen",
    panY: "Pan vertically across the screen",
    zoomIn: "Zoom in from small to large",
    zoomOut: "Zoom out from large to small",
    rotate: "Rotate 360 degrees",
    fade: "Fade in and out",
    bounce: "Bounce effect",
  };

  const getAnimationProps = (type: string) => {
    switch (type) {
      case "panY":
        return { top: 10, left: 150 };
      case "zoomIn":
        return { width: 40, height: 40, left: 180, top: 80 };
      case "zoomOut":
        return { width: 120, height: 120, left: 140, top: 40 };
      case "rotate":
        return { left: 160, top: 60 };
      case "fade":
        return { left: 160, top: 60 };
      case "bounce":
        return { left: 160, top: 20 };
      default:
        return { left: 10, top: 60 };
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Multi-Animation Demo</h2>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
        >
          Select Animation Type:
        </label>
        <select
          value={animationType}
          onChange={(e) => setAnimationType(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            width: "200px",
          }}
        >
          {Object.keys(animations).map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
        <p style={{ marginTop: "8px", color: "#666", fontSize: "14px" }}>
          {
            animationDescriptions[
              animationType as keyof typeof animationDescriptions
            ]
          }
        </p>
      </div>

      <AnimationContainer
        width={400}
        height={200}
        onRef={(ref) => (containerRef.current = ref)}
        style={{ marginBottom: "16px" }}
      >
        <AnimatedElement
          width={80}
          height={80}
          background="#FF6B6B"
          animation={animations[animationType as keyof typeof animations]}
          onRef={(ref) => (animatedElementRef.current = ref)}
          onAnimationStart={() => {
            if (containerRef.current) {
              startRecording(containerRef.current);
            }
          }}
          onAnimationEnd={() => {
            stopRecording();
            exportVideo(`animation-${animationType}.webm`).catch(console.error);
          }}
          {...getAnimationProps(animationType)}
        />
      </AnimationContainer>

      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <AnimationControls
          onStartAnimation={() => {
            if (!animatedElementRef.current) return;

            // Reset animation by reflow hack
            animatedElementRef.current.style.animation = "none";
            // Force reflow
            void animatedElementRef.current.offsetWidth;
            // Re-apply animation
            animatedElementRef.current.style.animation =
              animations[animationType as keyof typeof animations];
          }}
          disabled={isRecording}
        >
          {isRecording ? "Recording..." : `Start ${animationType} animation`}
        </AnimationControls>

        <VideoExport
          videoUrl={videoUrl}
          filename={`animation-${animationType}.webm`}
          variant="button"
          buttonVariant="primary"
        >
          Download {animationType} Video
        </VideoExport>
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "16px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          border: "1px solid #dee2e6",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Features Demonstrated:</h3>
        <ul style={{ marginBottom: 0 }}>
          <li>Multiple animation types with different effects</li>
          <li>Reusable components for different scenarios</li>
          <li>Configurable animation properties</li>
          <li>Real-time recording and export</li>
          <li>Clean separation of concerns</li>
        </ul>
      </div>
    </div>
  );
}
