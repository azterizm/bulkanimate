import { ArrowRightIcon, HeartIcon } from "@phosphor-icons/react";
import { animated, useSpring } from "@react-spring/web";
import { useEffect, useRef, useState } from "react";
import UploadGrid from "./upload-grid";
import UploadPreview from "./upload-preview";

export default function Home() {
	const [isAppOpen, setIsAppOpen] = useState(false);
	const [buttonRect, setButtonRect] = useState({ width: 0, height: 0 });
	const buttonRef = useRef<HTMLButtonElement>(null);
	const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

	const imagePreviews = uploadedFiles.map((file) => URL.createObjectURL(file));

	const [springs] = useSpring(
		() => ({
			headingSize: isAppOpen
				? uploadedFiles.length
					? "2.5rem"
					: "4.5rem"
				: "3rem",
			o: isAppOpen ? 0 : 1,
			rw: 0,
			rh: 0,
		}),
		[isAppOpen, uploadedFiles.length],
	);

	useEffect(() => {
		const rect = buttonRef.current?.getBoundingClientRect();
		if (rect)
			setButtonRect({
				width: rect.width,
				height: rect.height,
			});
	}, []);

	function handleClick() {
		setIsAppOpen(true);
	}

	function removeUpload(i: number) {
		setUploadedFiles((e) => [...e.slice(0, i), ...e.slice(i + 1)]);
	}

	function triggerFileInput() {
		// Create a new input element
		const input = document.createElement("input");
		input.type = "file";
		input.accept =
			"image/png, image/jpeg, image/jpg, image/gif, image/webp, image/avif, image/svg+xml, image/apng, image/bmp, .ico, .tif, .tiff";
		input.multiple = true;

		input.onchange = (e) => {
			const target = e.target as HTMLInputElement;
			// Only add files if there are actual files selected
			if (target.files && target.files.length > 0) {
				setUploadedFiles((c) => [...c, ...Array.from(target.files || [])]);
			}
			// Remove the input element from DOM after processing
			document.body.removeChild(input);
		};

		// Add to DOM, trigger click, then remove
		document.body.appendChild(input);
		input.click();
	}

	return (
		<div className="min-h-screen grid place-items-center">
			<main className="flex flex-col items-center justify-center relative">
				<animated.h1
					style={{ fontSize: springs.headingSize }}
					className="text-5xl font-semibold text-center leading-snug"
				>
					{isAppOpen
						? `${uploadedFiles.length ? "Check" : "Drop"} your stuff`
						: "Bulk Animate"}
				</animated.h1>
				<animated.p
					style={{ opacity: springs.o }}
					className="font-light mt-4 text-xl"
				>
					Give life to your media
				</animated.p>
				{isAppOpen ? (
					<UploadGrid
						onClick={triggerFileInput}
						rect={buttonRect}
						small={uploadedFiles.length > 0}
					/>
				) : (
					<button
						ref={buttonRef}
						onClick={handleClick}
						type="button"
						className="mt-16 bg-primary text-bg py-4 px-8"
					>
						Open App
					</button>
				)}

				<animated.button
					style={{ opacity: springs.o }}
					type="button"
					className=" mt-4 hover-underline-animation"
				>
					<span className="flex items-center gap-2">
						See what people made <ArrowRightIcon weight="bold" />{" "}
					</span>
				</animated.button>

				{isAppOpen && !uploadedFiles.length ? (
					<button
						onClick={triggerFileInput}
						type="button"
						className="font-light"
					>
						Choose File
					</button>
				) : null}

				<div className="mt-8 flex items-center gap-4 flex-wrap mx-8 justify-center">
					{imagePreviews.map((src, i) => (
						<UploadPreview
							key={i.toString()}
							src={src}
							onClick={() => removeUpload(i)}
						/>
					))}
				</div>

				{uploadedFiles.length ? (
					<button
						type="button"
						className="bg-primary text-bg px-8 py-4 mt-16 mb-16"
					>
						Start
					</button>
				) : null}
			</main>

			<animated.p
				style={{
					opacity: springs.o,
					transform: springs.o.to((o) => `translateY(${(1 - o) * 20}px)`),
				}}
				className="text-white absolute bottom-4 right-4 text-end max-w-[30vw]"
			>
				A web-based tool that takes media as input and applies motion effects
				(zoom, pan, rotate) to create short video outputs.{" "}
			</animated.p>

			<animated.p
				style={{
					opacity: springs.o,
					transform: springs.o.to((o) => `translateY(${(1 - o) * 20}px)`),
				}}
				className="text-white absolute bottom-4 left-4 text-left max-w-[40vw] flex items-center gap-2"
			>
				Made with <HeartIcon fill="var(--color-white)" /> by{" "}
				<a
					href="https://theimpossible.expert"
					className="hover-underline-animation hover:text-primary"
				>
					The Impossible
				</a>
			</animated.p>
		</div>
	);
}
