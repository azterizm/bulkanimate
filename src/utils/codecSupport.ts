/**
 * Codec support detection utilities for WebCodecs API
 */

export interface CodecSupport {
  supported: boolean;
  codec: string;
  config: Partial<VideoEncoderConfig>;
  label: string;
}

/**
 * Detects video codec support and returns the best available codec configuration
 * @returns Promise<CodecSupport> - Support information and best codec config
 */
export async function detectVideoCodecSupport(): Promise<CodecSupport> {
  // Check if VideoEncoder is available
  if (typeof VideoEncoder === 'undefined') {
    return {
      supported: false,
      codec: 'none',
      config: { codec: '', width: 0, height: 0 },
      label: 'WebCodecs not supported'
    };
  }

  // Codec preferences in order of priority
  const codecPreferences = [
    {
      codec: 'av01.0.08M.08',
      label: 'AV1 (High Efficiency)',
      config: {
        codec: 'av01.0.08M.08',
        width: 1920,
        height: 1080,
        bitrate: 8000000,
        framerate: 60,
        latencyMode: 'quality'
      } as VideoEncoderConfig
    },
    {
      codec: 'vp09.00.50.08',
      label: 'VP9 (Balanced)',
      config: {
        codec: 'vp09.00.50.08',
        width: 1920,
        height: 1080,
        bitrate: 8000000,
        framerate: 60,
        latencyMode: 'quality'
      } as VideoEncoderConfig
    },
    {
      codec: 'vp08.0.1',
      label: 'VP8 (Fallback)',
      config: {
        codec: 'vp08.0.1',
        width: 1920,
        height: 1080,
        bitrate: 6000000,
        framerate: 60,
        latencyMode: 'quality'
      } as VideoEncoderConfig
    }
  ];

  // Test each codec for support
  for (const codecInfo of codecPreferences) {
    try {
      const isSupported = await VideoEncoder.isConfigSupported(codecInfo.config);
      
      if (isSupported.supported) {
        return {
          supported: true,
          codec: codecInfo.codec,
          config: codecInfo.config,
          label: codecInfo.label
        };
      }
    } catch (error) {
      console.warn(`Codec ${codecInfo.codec} support check failed:`, error);
    }
  }

  // No codecs supported
  return {
    supported: false,
    codec: 'none',
    config: { codec: '', width: 0, height: 0 },
    label: 'No supported codecs found'
  };
}

/**
 * Gets MediaRecorder fallback codec configuration
 * @returns MediaRecorder configuration object
 */
export function getMediaRecorderConfig(): { mimeType: string; videoBitsPerSecond: number } {
  // Try VP9 first, then VP8
  const mimeTypes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm'
  ];

  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return {
        mimeType,
        videoBitsPerSecond: 8000000
      };
    }
  }

  // Last resort fallback
  return {
    mimeType: 'video/webm',
    videoBitsPerSecond: 6000000
  };
}