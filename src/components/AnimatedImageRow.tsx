import { useRef } from "react";
import { animated, useTrail } from "@react-spring/web";
import { useWheel } from "@use-gesture/react";

type AnimatedImageRowProps = {
	images: string[];
	onReset: () => void;
};

export default function AnimatedImageRow({
	images,
	onReset,
}: AnimatedImageRowProps) {
	const scrollerRef = useRef<HTMLDivElement>(null);

	const trail = useTrail(images.length, {
		from: { y: window.innerHeight + 40 },
		to: { y: 0 },
	});

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
		{
			target: scrollerRef,
			eventOptions: { passive: false },
		},
	);

	return (
		<div className="min-h-screen flex items-center justify-center overflow-visible">
			<div
				ref={scrollerRef}
				className="w-screen overflow-x-auto overflow-y-visible"
				style={{
					scrollBehavior: "smooth",
					overscrollBehaviorX: "contain",
					WebkitOverflowScrolling: "touch",
				}}
			>
				<div className="flex items-center gap-6 px-8 py-8 h-screen">
					{trail
						.slice()
						.reverse()
						.map((style, i) => (
							<animated.div
								key={i}
								className="shrink-0 max-w-xs max-h-80 w-max"
								style={{
									transform: style.y.to((y) => `translateY(${y}px)`),
								}}
							>
								<img
									src={images[i]}
									alt={`upload-${i}`}
									className="max-w-full max-h-80 w-auto h-auto rounded-md object-contain"
									draggable={false}
								/>
							</animated.div>
						))}
				</div>
			</div>

			<button onClick={onReset} className="absolute top-4 right-4 text-primary">
				Reset
			</button>
		</div>
	);
}
