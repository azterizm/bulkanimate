import { useRef, useState } from "react";
import "./App.css";
import {
  AnimatedElement,
  AnimationContainer,
  AnimationControls,
  VideoExport,
} from "./components";
import { useAnimationRecorder } from "./hooks";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animatedElementRef = useRef<HTMLDivElement>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<string>("Ready to record");
  const [animationKey, setAnimationKey] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const { startRecording, stopRecording, exportVideo } = useAnimationRecorder({
    fps: 30,
    resolutionScale: 4, // 4x resolution for 1600x800 output
    onRecordingStart: () => {
      setIsRecording(true);
      setStatus("🔴 Recording animation at 1600x800...");
    },
    onRecordingStop: () => {
      setIsRecording(false);
      setStatus("🎥 Processing high-resolution video...");
    },
    onExportComplete: (url) => {
      setVideoUrl(url);
      setStatus("✅ 1600x800 recording complete! Ready to download.");
    },
    onExportError: () => {
      setStatus("❌ Recording failed");
    },
  });

  const handleAnimationStart = () => {
    setStatus("🔴 Animation running...");

    // Start recording when animation actually starts
    if (containerRef.current && !isRecording) {
      startRecording(containerRef.current);
    }
  };

  const handleAnimationEnd = () => {
    setIsAnimating(false);

    // Clean up performance optimizations after animation
    if (animatedElementRef.current) {
      animatedElementRef.current.style.willChange = "auto";
    }

    // Only stop recording if we're actually recording
    if (isRecording) {
      setStatus("🎥 Processing video...");
      stopRecording();

      // Export after a short delay to ensure recording is fully stopped
      setTimeout(() => {
        exportVideo("animated-element.webm").catch(console.error);
      }, 100);
    }
  };

  const handleStartAnimation = () => {
    // Prevent multiple simultaneous recordings
    if (isRecording || isAnimating) {
      return;
    }

    // Reset state for new recording
    setVideoUrl("");
    setStatus("⏳ Starting animation...");
    setIsAnimating(true);

    if (!containerRef.current || !animatedElementRef.current) {
      setStatus("❌ Component not ready");
      setIsAnimating(false);
      return;
    }

    // Force animation reset by changing key
    setAnimationKey((prev) => prev + 1);

    // Apply animation after a brief delay to ensure reset
    setTimeout(() => {
      if (animatedElementRef.current) {
        const element = animatedElementRef.current;

        // Clear any existing animation first
        element.style.animation = "none";
        element.style.transition = "none";

        // Force reflow to ensure the change takes effect
        void element.offsetWidth;

        // Apply the spring animation with custom cubic-bezier easing for smooth 60fps
        element.style.animation =
          "springMove 2000ms cubic-bezier(0.68, -0.55, 0.265, 1.55) 1 forwards";

        // Optimize for 60fps performance
        element.style.willChange = "transform, left";
        element.style.transform = "translateZ(0)"; // Hardware acceleration
      }
    }, 100);
  };

  return (
    <>
      <AnimationContainer
        width={400}
        height={200}
        onRef={(ref) => (containerRef.current = ref)}
      >
        <AnimatedElement
          key={animationKey}
          onRef={(ref) => (animatedElementRef.current = ref)}
          width={80}
          height={80}
          left={10}
          top={60}
          background="#4CAF50"
          onAnimationStart={handleAnimationStart}
          onAnimationEnd={handleAnimationEnd}
        />
      </AnimationContainer>

      <div
        style={{
          marginTop: "8px",
          padding: "12px 16px",
          backgroundColor: "#f8f9fa",
          borderRadius: "6px",
          border: "1px solid #dee2e6",
          fontSize: "14px",
          color: "#495057",
          textAlign: "center",
          fontWeight: "500",
        }}
      >
        {status}
      </div>

      <div
        style={{
          marginTop: "16px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <AnimationControls
          onStartAnimation={handleStartAnimation}
          disabled={isRecording || isAnimating}
          variant="primary"
          style={{
            backgroundColor: isRecording ? "#6c757d" : "#007bff",
            padding: "10px 20px",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {isRecording
            ? "🔴 Recording..."
            : isAnimating
              ? "⏳ Animating..."
              : "▶️ Start animation & record"}
        </AnimationControls>

        {videoUrl && (
          <VideoExport
            videoUrl={videoUrl}
            filename="animated-element.webm"
            variant="button"
            buttonVariant="primary"
            style={{
              backgroundColor: "#28a745",
              padding: "10px 20px",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            ⬇️ Download 1600x800 Video
          </VideoExport>
        )}
      </div>
    </>
  );
}

export default App;
