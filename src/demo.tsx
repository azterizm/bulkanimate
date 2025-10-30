import { useRef, useState } from "react";
import { detectVideoCodecSupport } from "./utils/codecSupport";
import { encodeFramesWebCodecs } from "./utils/encodeWebCodecs";
import { encodeFramesWithMediaRecorder } from "./utils/mediaRecorderFallback";

const FastCanvasRecorder = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const previewCanvasRef = useRef<HTMLCanvasElement>(null);
	const [status, setStatus] = useState<string>("idle");
	const [videoUrl, setVideoUrl] = useState<string | null>(null);
	const [progress, setProgress] = useState<number>(0);
	const [info, setInfo] = useState<string>("");

	const springEase = (t: number): number => {
		const c4 = (2 * Math.PI) / 3;
		return t === 0
			? 0
			: t === 1
				? 1
				: 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
	};

	const drawFrame = (
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
		progress: number,
	): void => {
		ctx.imageSmoothingEnabled = false;
		ctx.fillStyle = "#1a1a1a";
		ctx.fillRect(0, 0, width, height);

		const startX = 20;
		const endX = width - 120;
		const easedProgress = springEase(progress);
		const x = Math.round(startX + (endX - startX) * easedProgress);
		const centerY = Math.round(height / 2 - 50);

		ctx.fillStyle = "#3b82f6";
		ctx.fillRect(x, centerY, 100, 100);

		ctx.imageSmoothingEnabled = true;
		ctx.fillStyle = "#ffffff";
		ctx.font = "14px monospace";
		ctx.fillText(`Frame: ${Math.round(progress * 600)}/600`, 20, 30);
		ctx.fillText(`Time: ${(progress * 10).toFixed(2)}s / 10s`, 20, 50);
	};

	// FAST METHOD: Pre-render all frames, then encode
	const recordAnimationFast = async () => {
		const canvas = canvasRef.current;
		const previewCanvas = previewCanvasRef.current;
		if (!canvas || !previewCanvas) return;

		const ctx = canvas.getContext("2d", { alpha: false });
		const previewCtx = previewCanvas.getContext("2d");

		if (!ctx || !previewCtx) {
			throw new Error("Failed to get canvas context");
		}

		const width = canvas.width;
		const height = canvas.height;
		const duration = 10000; // 10 seconds
		const fps = 60;
		const totalFrames = (duration / 1000) * fps; // 600 frames

		setStatus("rendering");
		setProgress(0);
		setInfo("Pre-rendering frames...");

		const renderStartTime = performance.now();

		try {
			// Step 1: Pre-render ALL frames into an array
			const frames: ImageData[] = [];

			for (let i = 0; i < totalFrames; i++) {
				const progress = i / totalFrames;

				// Draw to main canvas
				drawFrame(ctx, width, height, progress);

				// Update preview every 10 frames
				if (i % 10 === 0) {
					previewCtx.drawImage(
						canvas,
						0,
						0,
						previewCanvas.width,
						previewCanvas.height,
					);
					setProgress(Math.round((i / totalFrames) * 50)); // First 50% is rendering
					setInfo(`Rendering: ${i}/${totalFrames} frames`);

					// Allow UI to update
					await new Promise((resolve) => setTimeout(resolve, 0));
				}

				// Capture frame as ImageData
				const imageData = ctx.getImageData(0, 0, width, height);
				frames.push(imageData);
			}

			const renderEndTime = performance.now();
			const renderDuration = ((renderEndTime - renderStartTime) / 1000).toFixed(
				2,
			);

			setInfo(
				`Rendered ${totalFrames} frames in ${renderDuration}s. Detecting codec support...`,
			);
			setProgress(50);

			// Step 2: Detect codec support
			const codecSupport = await detectVideoCodecSupport();

			if (codecSupport.supported) {
				setInfo(`Using ${codecSupport.label} for fast encoding...`);
			} else {
				setInfo(`WebCodecs not supported, using MediaRecorder fallback...`);
			}

			// Step 3: Encode frames using appropriate method
			let blob: Blob;

			if (codecSupport.supported) {
				// Use WebCodecs + Mediabunny path
				const result = await encodeFramesWebCodecs(frames, codecSupport, {
					width,
					height,
					fps,
					duration,
					onProgress: (progress) => {
						setProgress(progress);
						setInfo(`Encoding with ${codecSupport.label}: ${progress}%`);
					},
				});
				blob = result.blob;
			} else {
				// Use MediaRecorder fallback path
				const result = await encodeFramesWithMediaRecorder(frames, {
					width,
					height,
					fps,
					duration,
					onProgress: (progress) => {
						setProgress(progress);
						setInfo(`Encoding with MediaRecorder: ${progress}%`);
					},
				});
				blob = result.blob;
			}

			const encodingEndTime = performance.now();
			const totalTime = ((encodingEndTime - renderStartTime) / 1000).toFixed(2);

			// Create video URL
			const url = URL.createObjectURL(blob);

			setVideoUrl(url);
			setStatus("completed");
			setProgress(100);

			const codecName = codecSupport.supported
				? codecSupport.label
				: "MediaRecorder";
			setInfo(`Complete! ${codecName} - Total time: ${totalTime}s`);
		} catch (error) {
			console.error("Recording failed:", error);
			setStatus("error");
			setInfo(
				`Error: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	};

	const resetDemo = () => {
		setStatus("idle");
		setProgress(0);
		setInfo("");
		if (videoUrl) {
			URL.revokeObjectURL(videoUrl);
			setVideoUrl(null);
		}

		const canvas = canvasRef.current;
		const previewCanvas = previewCanvasRef.current;
		if (canvas) {
			const ctx = canvas.getContext("2d");
			if (ctx) {
				ctx.fillStyle = "#1a1a1a";
				ctx.fillRect(0, 0, canvas.width, canvas.height);
			}
		}
		if (previewCanvas) {
			const ctx = previewCanvas.getContext("2d");
			if (ctx) {
				ctx.fillStyle = "#1a1a1a";
				ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
			}
		}
	};

	return (
		<div className="min-h-screen bg-gray-900 text-white p-8">
			<div className="max-w-6xl mx-auto space-y-6">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold">Fast Offline Rendering</h1>
					<p className="text-gray-400">
						10-second animation exported in ~2 seconds
					</p>
				</div>

				{/* Preview Canvas (visible) */}
				<div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
					<h3 className="text-sm font-semibold text-gray-400 mb-2">
						Live Preview
					</h3>
					<canvas
						ref={previewCanvasRef}
						width={1920}
						height={1080}
						className="w-full border border-gray-600 rounded bg-gray-950"
						style={{ maxHeight: "400px", objectFit: "contain" }}
					/>
				</div>

				{/* Hidden rendering canvas */}
				<canvas
					ref={canvasRef}
					width={1920}
					height={1080}
					style={{ display: "none" }}
				/>

				{/* Status */}
				{info && (
					<div
						className={`border rounded-lg px-4 py-3 text-sm ${
							status === "error"
								? "bg-red-900/30 border-red-700 text-red-300"
								: "bg-blue-900/30 border-blue-700 text-blue-300"
						}`}
					>
						{info}
					</div>
				)}

				{/* Controls */}
				<div className="flex gap-4 items-center flex-wrap">
					<button
						type="button"
						onClick={recordAnimationFast}
						disabled={status === "rendering"}
						className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition"
					>
						🚀 Fast Export (Offline)
					</button>

					{status === "completed" && (
						<button
							type="button"
							onClick={resetDemo}
							className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition"
						>
							Reset
						</button>
					)}

					{status === "rendering" && (
						<div className="flex items-center gap-3 ml-auto">
							<div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
								<div
									className="h-full bg-green-500 transition-all duration-100"
									style={{ width: `${progress}%` }}
								/>
							</div>
							<span className="text-sm text-gray-400 w-12">{progress}%</span>
						</div>
					)}
				</div>

				{/* Video Preview */}
				{videoUrl && (
					<div className="space-y-4 bg-gray-800 rounded-lg p-6 border border-gray-700">
						<h2 className="text-xl font-semibold">
							Exported Video (10 seconds @ 60fps)
						</h2>

						<video
							src={videoUrl}
							controls
							loop
							className="w-full rounded border border-gray-600"
							style={{ maxHeight: "540px" }}
						>
							<track kind="captions" srcLang="en" label="English captions" />
							Your browser does not support the video tag.
						</video>

						<a
							href={videoUrl}
							download="fast-export-10s-60fps.webm"
							className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition"
						>
							Download WebM (10s @ 60fps)
						</a>
					</div>
				)}
			</div>
		</div>
	);
};

export default FastCanvasRecorder;
