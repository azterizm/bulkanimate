import { toPng } from "html-to-image";
import { useCallback, useRef } from "react";

export interface UseAnimationRecorderOptions {
  fps?: number;
  mimeType?: string;
  resolutionScale?: number;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  onExportComplete?: (url: string, filename: string) => void;
  onExportError?: (error: Error) => void;
}

export interface UseAnimationRecorderReturn {
  isRecording: boolean;
  startRecording: (container: HTMLElement) => void;
  stopRecording: () => void;
  exportVideo: (filename?: string) => Promise<string>;
}

export function useAnimationRecorder(
  options: UseAnimationRecorderOptions = {},
): UseAnimationRecorderReturn {
  const {
    fps = 30,
    mimeType = "video/webm;codecs=vp9",
    resolutionScale = 4, // Default to 4x resolution for 1600x800 output
    onRecordingStart,
    onRecordingStop,
    onExportComplete,
    onExportError,
  } = options;

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const renderingRef = useRef<boolean>(false);
  const isRecordingRef = useRef<boolean>(false);

  const startRecording = useCallback(
    (container: HTMLElement) => {
      // Create canvas with scaled resolution
      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
        canvasRef.current.width = container.offsetWidth * resolutionScale;
        canvasRef.current.height = container.offsetHeight * resolutionScale;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      // Capture the canvas stream
      const stream = canvas.captureStream(fps);
      streamRef.current = stream;

      // Set up media recorder
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        isRecordingRef.current = false;
        onRecordingStop?.();
      };

      recorder.start();
      isRecordingRef.current = true;
      onRecordingStart?.();

      // Start render loop
      renderingRef.current = true;
      const renderFrame = async () => {
        if (!renderingRef.current) return;

        try {
          // Temporarily hide border during capture
          const originalBorder = container.style.border;
          container.style.border = "none";

          const dataUrl = await toPng(container, {
            style: { transform: "none" },
            quality: 1,
            pixelRatio: resolutionScale, // Use pixelRatio for high-res capture
          });

          // Restore border after capture
          container.style.border = originalBorder;

          const img = new Image();
          img.src = dataUrl;
          await new Promise((resolve) => {
            img.onload = resolve;
          });

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        } catch (err) {
          console.error("Render error:", err);
          onExportError?.(
            err instanceof Error ? err : new Error("Render error"),
          );
        }

        if (renderingRef.current) {
          requestAnimationFrame(renderFrame);
        }
      };

      requestAnimationFrame(renderFrame);
    },
    [
      fps,
      mimeType,
      resolutionScale,
      onRecordingStart,
      onRecordingStop,
      onExportError,
    ],
  );

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    renderingRef.current = false;
    isRecordingRef.current = false;
  }, []);

  const exportVideo = useCallback(
    async (filename = "capture.webm") => {
      if (chunksRef.current.length === 0) {
        const error = new Error("No recording data available");
        onExportError?.(error);
        throw error;
      }

      try {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        onExportComplete?.(url, filename);
        return url;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to export video");
        onExportError?.(error);
        throw error;
      }
    },
    [onExportComplete, onExportError],
  );

  return {
    isRecording: isRecordingRef.current,
    startRecording,
    stopRecording,
    exportVideo,
  };
}
