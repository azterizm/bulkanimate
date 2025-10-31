import { useEffect, useState } from "react";
import Input from "./components/input/home";
import AnimatedImageRow from "./components/AnimatedImageRow";

export default function App() {
  const [images, setImages] = useState<string[]>([]);

  function handleReset() {
    if (window.confirm("Are you sure you want to reset?")) {
      setImages([]);
    }
  }

  useEffect(() => {
    return () => {
      images.forEach((u) => {
        if (u && u.startsWith("blob:")) URL.revokeObjectURL(u);
      });
    };
  }, [images]);

  return images.length > 0 ? (<AnimatedImageRow onReset={handleReset} images={images} />) : (<Input onSubmit={setImages} />);
}
