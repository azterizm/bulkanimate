
import { useEffect, useState } from "react";
import ImageRendererIntro from "./image-renderer-intro";
import ImageRendererStatic from "./image-renderer-static";

type ImageRendererProps = {
	images: string[];
	onSelect: (rect: DOMRect, index: number|null) => void;
	selected: number | null;
};

export default function ImageRenderer({
	images,
	onSelect,
	selected,
}: ImageRendererProps) {
	const [introDone, setIntroDone] = useState(false);

	useEffect(() => {
		// Reset when image list changes
		setIntroDone(false);
	}, [images]);

	return introDone ? (
		<ImageRendererStatic
			images={images}
			onSelect={onSelect}
			selected={selected}
		/>
	) : (
		<ImageRendererIntro
			images={images}
			selected={selected}
			onComplete={() => setIntroDone(true)}
		/>
	);
}
