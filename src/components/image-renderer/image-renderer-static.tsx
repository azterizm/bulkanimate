import { animated, useSpring } from "@react-spring/web";
import { cn } from "../../utils/string";

type ImageRendererStaticProps = {
  images: string[];
  onSelect: (rect: DOMRect, index: number | null) => void;
  selected: number | null;
};

export default function ImageRendererStatic({
  images,
  onSelect,
  selected,
}: ImageRendererStaticProps) {
  const springs = useSpring(({ y: selected === null ? 25 : 0 }))

  function handleSelect(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    imgIndex: number,
  ) {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    if (selected === imgIndex) onSelect(rect, null)
    else onSelect(rect, imgIndex);
  }

  return (
    <animated.div
      style={{
        top: springs.y.to((y: number) => y + "vh")
      }}
      className="flex flex-row flex-nowrap relative gap-6 px-8 py-8 min-w-max h-full">
      {[...images.keys()].map((imgIndex) => (
        <div
          key={images[imgIndex] ?? imgIndex}
          className="flex-none max-w-xs max-h-80"
        >
          <button
            onClick={(e) => handleSelect(e, imgIndex)}
            className="block p-0 border-none bg-transparent cursor-pointer"
          >
            <img
              src={images[imgIndex]}
              alt={`upload-${imgIndex}`}
              className={cn(
                "block max-w-full max-h-80 w-auto h-auto rounded-md object-contain transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg hover:brightness-110",
                selected !== imgIndex && selected !== null ? "opacity-25" : "",
              )}
              draggable={false}
            />
          </button>
        </div>
      ))}
    </animated.div>
  );
}
