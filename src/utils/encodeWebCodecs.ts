/**
 * WebCodecs encoding utilities with Mediabunny muxing
 */

import {
  Output,
  WebMOutputFormat,
  BufferTarget,
  CanvasSource
} from 'mediabunny';
import type { CodecSupport } from './codecSupport';

export interface EncodeOptions {
  width: number;
  height: number;
  fps: number;
  duration: number; // in milliseconds
  onProgress?: (progress: number) => void;
}

export interface EncodeResult {
  blob: Blob;
  frameCount: number;
  codec: string;
  durations: {
    encode: number;
  };
}

/**
 * Encodes ImageData frames using WebCodecs API and Mediabunny muxer
 * @param frames - Array of ImageData frames
 * @param codecSupport - Codec support information
 * @param opts - Encoding options
 * @returns Promise<EncodeResult> - Encoding result with blob and metadata
 */
export async function encodeFramesWebCodecs(
  frames: ImageData[],
  codecSupport: CodecSupport,
  opts: EncodeOptions
): Promise<EncodeResult> {
  const startTime = performance.now();
  const { width, height, fps, onProgress } = opts;
  const totalFrames = frames.length;
  
  // Create output target
  const target = new BufferTarget();
  
  // Create WebM output format
  const format = new WebMOutputFormat();
  
  // Create output
  const output = new Output({
    target,
    format
  });
  
  // Create offscreen canvas for frame rendering
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get offscreen canvas context');
  }

  // Map WebCodecs codec strings to Mediabunny codec names
  function mapWebCodecsToMediabunny(webCodecsCodec: string): 'avc' | 'hevc' | 'vp9' | 'av1' | 'vp8' {
    if (webCodecsCodec.startsWith('av01')) return 'av1';
    if (webCodecsCodec.startsWith('vp09')) return 'vp9';
    if (webCodecsCodec.startsWith('vp08')) return 'vp8';
    if (webCodecsCodec.startsWith('avc1')) return 'avc';
    if (webCodecsCodec.startsWith('hev')) return 'hevc';
    return 'vp9'; // fallback
  }

  // Create video source with canvas
  const videoSource = new CanvasSource(canvas, {
    codec: mapWebCodecsToMediabunny(codecSupport.codec),
    bitrate: 8000000,
    latencyMode: 'quality',
    keyFrameInterval: 5 // Keyframe every 5 seconds
  });
  
  // Add video track to output
  output.addVideoTrack(videoSource, { frameRate: fps });
  
  // Start the output
  await output.start();
  
  // Add frames to the video source
  const frameDuration = 1 / fps; // Duration in seconds
  
  for (let i = 0; i < frames.length; i++) {
    const imageData = frames[i];
    
    // Draw ImageData to canvas
    ctx.putImageData(imageData, 0, 0);
    
    // Add frame with correct timing
    const timestamp = i * frameDuration;
    await videoSource.add(timestamp, frameDuration);
    
    // Update progress (50-100% range for encoding)
    if (onProgress && i % 10 === 0) {
      const progress = 50 + Math.round((i / totalFrames) * 50);
      onProgress(Math.min(progress, 99)); // Don't reach 100% until finalization
    }
  }
  
  // Close the video source
  videoSource.close();
  
  // Finalize the output
  await output.finalize();
  
  // Get blob from target
  const buffer = target.buffer;
  if (!buffer) {
    throw new Error('Failed to generate video buffer');
  }
  const blob = new Blob([buffer], { type: 'video/webm' });
  
  const endTime = performance.now();
  const encodeDuration = (endTime - startTime) / 1000;

  return {
    blob,
    frameCount: totalFrames,
    codec: codecSupport.codec,
    durations: {
      encode: encodeDuration
    }
  };
}

/**
 * Creates a VideoFrame from ImageData using an offscreen canvas
 * @param imageData - ImageData to convert
 * @param timestamp - Frame timestamp in microseconds
 * @param duration - Frame duration in microseconds
 * @returns VideoFrame
 */
export function imageDataToVideoFrame(
  imageData: ImageData,
  timestamp: number,
  duration: number
): VideoFrame {
  const canvas = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to create offscreen canvas context');
  }
  
  ctx.putImageData(imageData, 0, 0);
  return new VideoFrame(canvas, { timestamp, duration });
}