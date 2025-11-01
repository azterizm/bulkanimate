import { useWheel } from "@use-gesture/react";
import { useRef, useState } from "react";
import ImageRenderer from "./image-renderer";
import ResetButton from "./reset-button";

type AnimatedImageRowProps = {
  images: string[];
  onReset: () => void;
};

export default function ImageRow({ images, onReset }: AnimatedImageRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [selected,setSelected] = useState<number|null>(null)

  useWheel(
    ({ event, delta: [dx, dy] }) => {
      const el = scrollerRef.current;
      if (!el) return;

      const scrollDelta = Math.abs(dy) > Math.abs(dx) ? dy : dx;
      if (scrollDelta !== 0) {
        el.scrollLeft += scrollDelta * 20;
        event.preventDefault();
      }
    },
    { target: scrollerRef, eventOptions: { passive: false } },
  );

  function handleSelect(rect:DOMRect,index: number|null) {
    console.log("Selected rect", rect);
    console.log("Selected image", index);
    setSelected(index)


  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div
        ref={scrollerRef}
        className="w-screen h-screen overflow-x-auto overflow-y-hidden scroll-smooth"
        style={{
          overscrollBehaviorX: "contain",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <ImageRenderer selected={selected} onSelect={handleSelect} images={images} />
      </div>

      <ResetButton hide={selected !== null} onClick={onReset} />
    </div>
  );
}
