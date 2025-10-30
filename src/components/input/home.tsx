import { ArrowRightIcon, HeartIcon } from "@phosphor-icons/react";
import { animated, useSpring } from "@react-spring/web";
import { useEffect, useRef, useState } from "react";
import UploadGrid from "./upload-grid";

export default function Home() {
	const [isAppOpen, setIsAppOpen] = useState(false);
	const [buttonRect, setButtonRect] = useState({ width: 0, height: 0 });
	const buttonRef = useRef<HTMLButtonElement>(null);

	const [springs] = useSpring(
		() => ({
			headingSize: isAppOpen ? "4.5rem" : "3rem",
			o: isAppOpen ? 0 : 1,
			rw: 0,
			rh: 0,
		}),
		[isAppOpen],
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

	return (
		<div className="min-h-screen grid place-items-center">
			<main className="flex flex-col items-center justify-center relative">
				<animated.h1
					style={{ fontSize: springs.headingSize }}
					className="text-5xl font-semibold text-center leading-snug"
				>
					{isAppOpen ? "Drop your stuff" : "Bulk Animate"}
				</animated.h1>
				<animated.p
					style={{ opacity: springs.o }}
					className="font-light mt-4 text-xl"
				>
					Give life to your media
				</animated.p>
				{isAppOpen ? (
					<UploadGrid onClick={() => null} rect={buttonRect} />
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

				{isAppOpen ? (
					<button type="button" className="font-light">
						Choose File
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
