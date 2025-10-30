import { TrashIcon } from "@phosphor-icons/react";
import { animated, useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";

export default function UploadPreview({
	src,
	onClick,
}: {
	src: string;
	onClick: () => void;
}) {
	const [imageState, setImageState] = useState<"loading" | "loaded" | "error">(
		"loading",
	);
	const [isRemoving, setIsRemoving] = useState(false);
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

	// Check for reduced motion preference
	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		setPrefersReducedMotion(mediaQuery.matches);

		const handleChange = (e: MediaQueryListEvent) => {
			setPrefersReducedMotion(e.matches);
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, []);

	// Enhanced spring animation with config matching site aesthetics
	const springs = useSpring({
		from: { opacity: 0, y: prefersReducedMotion ? 0 : 15 },
		to: { opacity: 1, y: 0 },
		config: { tension: 280, friction: 40 },
		immediate: prefersReducedMotion,
	});

	// Remove animation spring
	const removeSprings = useSpring({
		opacity: isRemoving ? 0 : 1,
		scale: isRemoving ? 0.8 : 1,
		config: { tension: 300, friction: 30 },
		immediate: prefersReducedMotion,
		onRest: () => {
			if (isRemoving) {
				onClick();
			}
		},
	});

	const handleImageLoad = () => setImageState("loaded");
	const handleImageError = () => setImageState("error");

	const handleClick = () => {
		if (!isRemoving) {
			setIsRemoving(true);
		}
	};

	return (
		<animated.button
			style={{
				...springs,
				...removeSprings,
			}}
			type="button"
			className="relative group rounded-md overflow-hidden shadow-lg max-w-xs max-h-80 transition-transform duration-200 ease-out hover:scale-[1.02] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 focus-visible:ring-offset-bg w-max"
			onClick={handleClick}
			disabled={isRemoving}
		>
			{/* Skeleton placeholder while loading */}
			{imageState === "loading" && (
				<div className="absolute inset-0 bg-bg/50 animate-pulse" />
			)}

			{/* Error fallback */}
			{imageState === "error" && (
				<div className="absolute inset-0 bg-error/20 flex items-center justify-center">
					<p className="text-error text-sm font-medium">Failed to load</p>
				</div>
			)}

			{/* Image with performance optimizations */}
			<img
				src={src}
				alt={`Uploaded preview`}
				className={`max-w-full max-h-80 w-auto h-auto ${imageState === "loaded" ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
				loading="lazy"
				decoding="async"
				onLoad={handleImageLoad}
				onError={handleImageError}
			/>

			{/* Hover/focus overlay with centered content */}
			<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 flex items-center justify-center">
				<div className="bg-bg/90 text-bg px-3 py-2 rounded-full flex items-center gap-2 transition-colors duration-200 group-hover:bg-error group-focus:bg-error">
					<TrashIcon size={16} weight="bold" />
					<span className="text-sm font-medium">Remove</span>
				</div>
			</div>
		</animated.button>
	);
}
