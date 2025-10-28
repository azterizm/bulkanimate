/**
 * MediaRecorder fallback utilities for browsers without WebCodecs support
 */

import { getMediaRecorderConfig } from './codecSupport';

export interface FallbackOptions {
  width: number;
  height: number;
  fps: number;
  duration: number; // in milliseconds
  onProgress?: (progress: number) => void;
}

export interface FallbackResult {
  blob: Blob;
  frameCount: number;
}

/**
 * Encodes ImageData frames using MediaRecorder with real-time pacing
 * This ensures correct duration by feeding frames at precise intervals
 * @param frames - Array of ImageData frames
 * @param opts - Fallback options
 * @returns Promise<FallbackResult> - Encoding result with blob and metadata
 */
export async function encodeFramesWithMediaRecorder(
  frames: ImageData[],
  opts: FallbackOptions
): Promise<FallbackResult> {
  const { width, height, fps,  onProgress } = opts;
  const totalFrames = frames.length;
  
  // Create canvas for rendering
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Get MediaRecorder configuration
  const recorderConfig = getMediaRecorderConfig();
  
  // Create stream from canvas
  const stream = canvas.captureStream(0); // Manual frame capture
  const chunks: Blob[] = [];

  // Create MediaRecorder
  const recorder = new MediaRecorder(stream, recorderConfig);

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  const recordingComplete = new Promise<void>((resolve) => {
    recorder.onstop = () => resolve();
  });

  // Start recording
  recorder.start();

  // Calculate frame timing
  const frameDurationMs = 1000 / fps;
  const startTime = performance.now();
  
  // Feed frames at real-time pace
  for (let i = 0; i < frames.length; i++) {
    const targetTime = startTime + (i * frameDurationMs);
    const currentTime = performance.now();
    
    // Wait until it's time for this frame
    if (currentTime < targetTime) {
      await new Promise(resolve => setTimeout(resolve, targetTime - currentTime));
    }
    
    // Draw frame to canvas
    ctx.putImageData(frames[i], 0, 0);
    
    // Request frame capture
    const track = stream.getVideoTracks()[0];
    if ('requestFrame' in track && typeof (track as any).requestFrame === 'function') {
      (track as any).requestFrame();
    }
    
    // Update progress
    if (onProgress && i % 10 === 0) {
      const progress = Math.round((i / totalFrames) * 100);
      onProgress(Math.min(progress, 99)); // Don't reach 100% until finalization
    }
  }

  // Stop recording
  recorder.stop();
  await recordingComplete;

  // Create blob
  const blob = new Blob(chunks, { type: recorderConfig.mimeType });

  return {
    blob,
    frameCount: totalFrames
  };
}

/**
 * Creates a canvas-based video source for MediaRecorder
 * @param width - Canvas width
 * @param height - Canvas height
 * @returns Canvas and context for rendering
 */
export function createCanvasForRecording(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  
  if (!ctx) {
    throw new Error('Failed to create canvas context');
  }
  
  return { canvas, ctx };
}