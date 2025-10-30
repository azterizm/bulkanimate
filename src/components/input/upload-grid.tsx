import { animated, to, useSpring } from "@react-spring/web";
import { useEffect } from "react";

export default function UploadGrid(props: {
	onClick: () => void;
	rect: {
		width: number;
		height: number;
	};
	small?: boolean;
}) {
	const [containerSprings, containerApi] = useSpring(
		() => ({
			from: {
				width: props.rect.width,
				height: props.rect.height,
			},
			to: {
				width: props.small ? 160 : 320,
				height: props.small ? 160 : 320,
			},
		}),
		[props.rect, props.small],
	);

	// Enhanced arrow animation springs with flat design
	const [arrowSprings, arrowApi] = useSpring(
		() => ({
			progress: 0,
			opacity: 0,
			base: 0,
			scale: 0.8,
			config: { tension: 280, friction: 60 },
		}),
		[],
	);

	// Icon transition spring for seamless arrow to plus icon animation
	const [iconTransitionSprings, iconTransitionApi] = useSpring(
		() => ({
			progress: props.small ? 1 : 0,
			config: { tension: 220, friction: 24 },
		}),
		[props.small],
	);

	// Enhanced animation sequence with flat design (no rotation, no glow)
	useEffect(() => {
		// Skip arrow animation if starting in small mode
		if (props.small) {
			arrowApi.start({
				opacity: 0,
				scale: 0.8,
				progress: 0,
				base: 0,
				immediate: true,
			});
			return;
		}

		const timer = setTimeout(() => {
			// Initial fade-in with scale effect
			arrowApi.start({
				opacity: 1,
				scale: 1,
				config: { tension: 200, friction: 25 },
			});

			// Arrow rising animation (no rotation for flat design)
			setTimeout(() => {
				arrowApi.start({
					progress: 1,
					config: { tension: 300, friction: 40 },
				});
			}, 300);

			// Base line animation
			setTimeout(() => {
				arrowApi.start({
					base: 1,
					config: { tension: 250, friction: 30 },
				});
			}, 900);
		}, 400);

		return () => clearTimeout(timer);
	}, [arrowApi, props.small]);

	useEffect(() => {
		if (props.small) {
			containerApi.start({
				width: 160,
				height: 160,
			});
			iconTransitionApi.start({
				progress: 1,
			});
		} else {
			containerApi.start({
				width: 320,
				height: 320,
			});
			iconTransitionApi.start({
				progress: 0,
			});
		}
	}, [props.small, containerApi, iconTransitionApi]);

	// Fixed square viewBox and paths for uniform geometry
	const viewBox = "0 0 100 100";

	// Corner paths in 100x100 coordinate space (12.5 to 25 units from edges)
	const topLeftPath = "M 12.5 12.5 L 12.5 25 L 12.5 12.5 L 25 12.5";
	const topRightPath = "M 87.5 12.5 L 87.5 25 L 87.5 12.5 L 75 12.5";
	const bottomLeftPath = "M 12.5 87.5 L 12.5 75 L 12.5 87.5 L 25 87.5";
	const bottomRightPath = "M 87.5 87.5 L 87.5 75 L 87.5 87.5 L 75 87.5";

	// Constant stroke width in screen pixels
	const strokeWidth = 4;

	// Enhanced arrow geometry calculations with flat, wide design
	const arrowOpacity = to(
		[arrowSprings.opacity, iconTransitionSprings.progress],
		(opacity: number, transitionProgress: number) =>
			opacity * (1 - transitionProgress),
	);
	const arrowScale = to([arrowSprings.scale], (scale: number) => scale);

	// Wide, flat arrow path with significantly increased width
	const arrowPath = to([arrowSprings.progress], (progress: number) => {
		const centerX = 50;
		const centerY = 45;
		const headWidth = 24; // Significantly wider arrow head
		const headHeight = 16; // Balanced height
		const shaftWidth = 12; // Much wider shaft for bold appearance
		const shaftLength = 35; // Maintain overall size
		const baseY = centerY + shaftLength / 2;
		const tipY = centerY - shaftLength / 2;

		// Enhanced animation with easing curve
		const startOffset = 20;
		const easeProgress =
			progress < 0.5
				? 2 * progress * progress
				: 1 - Math.pow(-2 * progress + 2, 2) / 2;
		const currentOffset = startOffset * (1 - easeProgress);

		// Wide, bold arrow path with flat design
		return `
				M ${centerX - shaftWidth / 2} ${baseY + currentOffset}
				L ${centerX - shaftWidth / 2} ${tipY + headHeight + currentOffset}
				L ${centerX - headWidth / 2} ${tipY + headHeight + currentOffset}
				L ${centerX} ${tipY + currentOffset}
				L ${centerX + headWidth / 2} ${tipY + headHeight + currentOffset}
				L ${centerX + shaftWidth / 2} ${tipY + headHeight + currentOffset}
				L ${centerX + shaftWidth / 2} ${baseY + currentOffset}
				Z
			`;
	});

	// Enhanced base line with professional styling
	const baseLineWidth = to([arrowSprings.base], (base: number) => {
		const minWidth = 30;
		const maxWidth = 55;
		const easeProgress =
			base < 0.5 ? 2 * base * base : 1 - Math.pow(-2 * base + 2, 2) / 2;
		return minWidth + (maxWidth - minWidth) * easeProgress;
	});

	const baseLineX = to(
		[baseLineWidth],
		(lineWidth: number) => (100 - lineWidth) / 2,
	);

	const baseLineY = 68; // Better positioned relative to arrow
	const baseLineOpacity = to(
		[arrowSprings.base, iconTransitionSprings.progress],
		(base: number, transitionProgress: number) =>
			(0.7 + base * 0.3) * (1 - transitionProgress),
	);
	return (
		<animated.div
			onMouseDown={props.onClick}
			style={{
				width: containerSprings.width,
				height: containerSprings.height,
			}}
			className="cursor-pointer w-80 h-80 relative"
		>
			<animated.svg
				width="100%"
				height="100%"
				viewBox={viewBox}
				xmlns="http://www.w3.org/2000/svg"
				preserveAspectRatio="xMidYMid meet"
			>
				<title>Upload files</title>
				{/* Top-left corner */}
				<path
					d={topLeftPath}
					stroke="var(--color-primary)"
					strokeWidth={strokeWidth}
					fill="none"
					vectorEffect="non-scaling-stroke"
					strokeLinecap="square"
					strokeLinejoin="miter"
				/>
				{/* Top-right corner */}
				<path
					d={topRightPath}
					stroke="var(--color-primary)"
					strokeWidth={strokeWidth}
					fill="none"
					vectorEffect="non-scaling-stroke"
					strokeLinecap="square"
					strokeLinejoin="miter"
				/>
				{/* Bottom-left corner */}
				<path
					d={bottomLeftPath}
					stroke="var(--color-primary)"
					strokeWidth={strokeWidth}
					fill="none"
					vectorEffect="non-scaling-stroke"
					strokeLinecap="square"
					strokeLinejoin="miter"
				/>
				{/* Bottom-right corner */}
				<path
					d={bottomRightPath}
					stroke="var(--color-primary)"
					strokeWidth={strokeWidth}
					fill="none"
					vectorEffect="non-scaling-stroke"
					strokeLinecap="square"
					strokeLinejoin="miter"
				/>

				{/* Enhanced animated arrow with flat, wide design */}
				<animated.g
					opacity={arrowOpacity}
					transform={to(
						[arrowScale],
						(scale) => `translate(50, 50) scale(${scale}) translate(-50, -50)`,
					)}
				>
					<animated.path
						d={arrowPath}
						fill="var(--color-primary)"
						stroke="none"
					/>
				</animated.g>

				{/* Enhanced base line matching wide arrow design */}
				<animated.g opacity={baseLineOpacity}>
					<animated.line
						x1={baseLineX}
						y1={baseLineY}
						x2={to([baseLineX, baseLineWidth], (x, width) => x + width)}
						y2={baseLineY}
						stroke="var(--color-primary)"
						strokeWidth={strokeWidth + 2} // Thicker to match wide arrow
						strokeLinecap="round"
						vectorEffect="non-scaling-stroke"
					/>
				</animated.g>

				{/* Plus icon for small state */}
				<animated.g
					opacity={iconTransitionSprings.progress}
					transform={to(
						[arrowScale],
						(scale) => `translate(50, 50) scale(${scale}) translate(-50, -50)`,
					)}
				>
					{/* Horizontal bar of plus */}
					<rect
						x="30"
						y="47"
						width="40"
						height="6"
						rx="3"
						fill="var(--color-primary)"
					/>
					{/* Vertical bar of plus */}
					<rect
						x="47"
						y="30"
						width="6"
						height="40"
						rx="3"
						fill="var(--color-primary)"
					/>
				</animated.g>
			</animated.svg>
		</animated.div>
	);
}
