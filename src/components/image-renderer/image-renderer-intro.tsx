import { animated, useSprings } from "@react-spring/web";
import { cn } from "../../utils/string";

type ImageRendererIntroProps = {
  images: string[];
  selected: number | null;
  onComplete: () => void;
};

export default function ImageRendererIntro({
  images,
  selected,
  onComplete,
}: ImageRendererIntroProps) {
  const startY = typeof window !== "undefined" ? window.innerHeight : 500;

  const springs = useSprings(
    images.length,
    images.map((_, i) => ({
      from: { y: startY },
      to: { y: 0 },
      delay: i * 100,
      onRest: () => {
        if (i === images.length - 1) {
          setTimeout(() => {
            onComplete();
          }, 200);
        }
      },
    })),
  );

  return (
    <div className="flex flex-row flex-nowrap gap-6 top-[25vh] relative px-8 py-8 min-w-max h-full">
      {springs.map((style, i) => {
        return (
          <animated.div
            key={images[i] ?? i}
            className="flex-none max-w-xs max-h-80"
            style={{
              transform: style.y.to((y: number) => `translateY(${y}px)`),
            }}
          >
            <button
              className="block p-0 border-none bg-transparent cursor-default"
            >
              <img
                src={images[i]}
                alt={`upload-${i}`}
                className={cn(
                  "block max-w-full max-h-80 w-auto h-auto rounded-md object-contain transition-all duration-300 ease-out",
                  selected !== i && selected !== null ? "opacity-25" : "",
                )}
                draggable={false}
              />
            </button>
          </animated.div>
        );
      })}
    </div>
  );
}
