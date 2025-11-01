import { useState } from "react";
import ImageRow from "./components/image-row";
import Input from "./components/input/home";

export default function App() {
  const [images, setImages] = useState<string[]>([]);

  function handleReset() {
    if (window.confirm("Are you sure you want to reset?")) {
      setImages([]);
    }
  }

  return images.length > 0 ? (<ImageRow onReset={handleReset} images={images} />) : (<Input onSubmit={setImages} />);
}
