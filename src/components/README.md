# AnimateBulk Components

This directory contains reusable React components for creating animated videos from static images. The components are designed to be modular, customizable, and easy to compose together.

## Components Overview

### AnimationContainer
A container component that provides a styled container for animated elements.

```tsx
import { AnimationContainer } from './components';

<AnimationContainer
  width={400}
  height={200}
  onRef={(ref) => containerRef.current = ref}
  style={{ border: '2px solid red' }}
>
  {/* Your animated content here */}
</AnimationContainer>
```

**Props:**
- `children: ReactNode` - The animated elements to contain
- `width?: number` - Container width (default: 400)
- `height?: number` - Container height (default: 200)
- `className?: string` - Additional CSS classes
- `style?: CSSProperties` - Additional inline styles
- `onRef?: (ref: HTMLDivElement | null) => void` - Callback to get container reference

### AnimatedElement
A component for elements that can be animated using CSS animations.

```tsx
import { AnimatedElement } from './components';

<AnimatedElement
  width={80}
  height={80}
  left={10}
  top={60}
  background="#4CAF50"
  animation="panX 2000ms linear 1 forwards"
  onRef={(ref) => elementRef.current = ref}
  onAnimationStart={() => console.log('Animation started')}
  onAnimationEnd={() => console.log('Animation ended')}
/>
```

**Props:**
- `children?: ReactNode` - Content inside the animated element
- `width?: number` - Element width (default: 80)
- `height?: number` - Element height (default: 80)
- `left?: number` - Left position (default: 10)
- `top?: number` - Top position (default: 60)
- `background?: string` - Background color (default: "#4CAF50")
- `className?: string` - Additional CSS classes
- `style?: CSSProperties` - Additional inline styles
- `animation?: string` - CSS animation string
- `onAnimationStart?: () => void` - Animation start callback
- `onAnimationEnd?: () => void` - Animation end callback
- `onRef?: (ref: HTMLDivElement | null) => void` - Callback to get element reference

### AnimationControls
A button component for controlling animations.

```tsx
import { AnimationControls } from './components';

<AnimationControls
  onStartAnimation={() => startAnimation()}
  disabled={isRecording}
  variant="primary"
>
  Start Animation
</AnimationControls>
```

**Props:**
- `onStartAnimation?: () => void` - Callback when animation should start
- `children?: React.ReactNode` - Button content
- `variant?: "primary" | "secondary"` - Button style variant (default: "primary")
- `disabled?: boolean` - Whether button is disabled
- All standard HTML button attributes are supported

### VideoExport
A component for exporting recorded videos.

```tsx
import { VideoExport } from './components';

<VideoExport
  videoUrl={videoUrl}
  filename="my-animation.webm"
  variant="button"
  buttonVariant="primary"
  onExportComplete={(url, filename) => console.log('Export complete')}
>
  Download Video
</VideoExport>
```

**Props:**
- `videoUrl?: string` - The blob URL of the video to download
- `filename?: string` - Download filename (default: "capture.webm")
- `onExportComplete?: (url: string, filename: string) => void` - Export complete callback
- `children?: React.ReactNode` - Link/button content
- `variant?: "link" | "button"` - Display variant (default: "link")
- `buttonVariant?: "primary" | "secondary"` - Button style when variant is "button" (default: "primary")
- All standard HTML anchor attributes are supported

## Hooks Overview

### useAnimationRecorder
A custom hook that handles the recording logic for animated content.

```tsx
import { useAnimationRecorder } from './hooks';

const { startRecording, stopRecording, exportVideo, isRecording } = useAnimationRecorder({
  fps: 30,
  mimeType: "video/webm;codecs=vp9",
  onRecordingStart: () => console.log('Recording started'),
  onRecordingStop: () => console.log('Recording stopped'),
  onExportComplete: (url, filename) => console.log('Export complete'),
  onExportError: (error) => console.error('Recording error'),
});
```

**Options:**
- `fps?: number` - Frames per second for recording (default: 30)
- `mimeType?: string` - MIME type for video encoding (default: "video/webm;codecs=vp9")
- `onRecordingStart?: () => void` - Callback when recording starts
- `onRecordingStop?: () => void` - Callback when recording stops
- `onExportComplete?: (url: string, filename: string) => void` - Callback when export is complete
- `onExportError?: (error: Error) => void` - Callback when an error occurs

**Returns:**
- `isRecording: boolean` - Whether recording is currently active
- `startRecording: (container: HTMLElement) => void` - Function to start recording
- `stopRecording: () => Promise<void>` - Function to stop recording
- `exportVideo: (filename?: string) => Promise<string>` - Function to export video as blob URL

## Usage Examples

### Basic Animation Recording

```tsx
import { useRef, useState } from 'react';
import { AnimationContainer, AnimatedElement, AnimationControls, VideoExport } from './components';
import { useAnimationRecorder } from './hooks';

function BasicExample() {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const [videoUrl, setVideoUrl] = useState('');

  const { startRecording, stopRecording, exportVideo } = useAnimationRecorder({
    onExportComplete: setVideoUrl,
  });

  const handleStartAnimation = () => {
    if (!elementRef.current) return;
    
    // Reset and restart animation
    elementRef.current.style.animation = 'none';
    void elementRef.current.offsetWidth;
    elementRef.current.style.animation = 'panX 2000ms linear 1 forwards';
  };

  return (
    <>
      <AnimationContainer onRef={(ref) => containerRef.current = ref}>
        <AnimatedElement
          ref={elementRef}
          animation="panX 2000ms linear 1 forwards"
          onAnimationStart={() => startRecording(containerRef.current!)}
          onAnimationEnd={() => stopRecording().then(() => exportVideo())}
        />
      </AnimationContainer>
      
      <AnimationControls onStartAnimation={handleStartAnimation} />
      <VideoExport videoUrl={videoUrl} filename="animation.webm" />
    </>
  );
}
```

### Multiple Animations

```tsx
// See examples/MultiAnimationDemo.tsx for a complete example
```

## Styling

Components use inline styles by default but can be customized through:

1. **CSS Classes**: Pass `className` props to add custom CSS classes
2. **Inline Styles**: Use the `style` prop for additional styling
3. **CSS Variables**: Components inherit CSS variables from their parent

## Animation Keyframes

The following CSS animations are available in `App.css`:

- `panX` - Horizontal movement
- `panY` - Vertical movement  
- `zoomIn` - Scale up from small to large
- `zoomOut` - Scale down from large to small
- `rotate` - 360-degree rotation
- `fade` - Fade in and out
- `bounce` - Bounce effect

## Browser Compatibility

- Recording requires modern browsers with MediaRecorder API support
- Canvas-based rendering works in all modern browsers
- WebM export is supported in Chrome, Firefox, Edge
- For MP4 export, consider server-side conversion or ffmpeg.wasm

## Performance Tips

1. Keep animation durations reasonable (2-5 seconds)
2. Use efficient CSS transforms instead of position changes when possible
3. Limit the number of animated elements
4. Consider reducing recording fps for longer animations
5. Use hardware acceleration (`transform: translateZ(0)`) for complex animations