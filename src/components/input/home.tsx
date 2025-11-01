import { ArrowRightIcon, HeartIcon } from "@phosphor-icons/react";
import { animated, useSpring } from "@react-spring/web";
import { useEffect, useRef, useState } from "react";
import UploadGrid from "./upload-grid";
import UploadPreview from "./upload-preview";

export default function Home(props: { onSubmit: (images: string[]) => void }) {
	const [isAppOpen, setIsAppOpen] = useState(false);
	const [buttonRect, setButtonRect] = useState({ width: 0, height: 0 });
	const buttonRef = useRef<HTMLButtonElement>(null);
	const [uploads, setUploads] = useState<
		{ id: string; file: File; url: string }[]
	>([]);

	const [springs, api] = useSpring(
		() => ({
			headingSize: isAppOpen ? (uploads.length ? "2.5rem" : "4.5rem") : "3rem",
			o: isAppOpen ? 0 : 1,
			rw: 0,
			rh: 0,
			co: 1,
		}),
		[isAppOpen, uploads.length],
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

	function removeUpload(id: string) {
		setUploads((prev) => {
			const item = prev.find((u) => u.id === id);
			if (item) URL.revokeObjectURL(item.url);
			return prev.filter((u) => u.id !== id);
		});
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
			if (target.files && target.files.length > 0) {
				const newItems = Array.from(target.files).map((file) => ({
					id: crypto.randomUUID(),
					file,
					url: URL.createObjectURL(file),
				}));
				setUploads((prev) => [...prev, ...newItems]);
			}
			document.body.removeChild(input);
		};

		// Add to DOM, trigger click, then remove
		document.body.appendChild(input);
		input.click();
	}

	async function onSubmit() {
		api.start({
			co: 0,
			onRest: async () => {
				const dataUris = await Promise.all(
					uploads.map(async (u) => {
						return new Promise<string>((resolve, reject) => {
							const reader = new FileReader();
							reader.onload = () => {
								const result = reader.result as string;
								if (result.startsWith("data:")) {
									resolve(result);
								} else {
									reject(new Error("Invalid data URI generated"));
								}
							};
							reader.onerror = () => reject(new Error("Failed to read file"));
							reader.readAsDataURL(u.file);
						});
					}),
				);
				props.onSubmit(dataUris);
			},
		});
	}

	return (
		<div className="min-h-screen grid place-items-center">
			<animated.main
				style={{ opacity: springs.co }}
				className="flex flex-col items-center justify-center relative"
			>
				<animated.h1
					style={{ fontSize: springs.headingSize }}
					className="text-5xl font-semibold text-center leading-snug"
				>
					{isAppOpen
						? `${uploads.length ? "Check" : "Drop"} your stuff`
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
						small={uploads.length > 0}
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

				{isAppOpen && !uploads.length ? (
					<button
						onClick={triggerFileInput}
						type="button"
						className="font-light"
					>
						Choose File
					</button>
				) : null}

				<div className="mt-8 flex items-center gap-4 flex-wrap mx-8 justify-center">
					{uploads.map((u) => (
						<UploadPreview
							key={u.id}
							src={u.url}
							onClick={() => removeUpload(u.id)}
						/>
					))}
				</div>

				{uploads.length ? (
					<button
						type="button"
						className="bg-primary text-bg px-8 py-4 mt-16 mb-16"
						onClick={onSubmit}
					>
						Start
					</button>
				) : null}
			</animated.main>

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
