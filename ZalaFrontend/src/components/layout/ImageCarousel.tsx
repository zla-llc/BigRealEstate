import { useState } from "react";
import { IconButton } from "../buttons";
import { ImageCard } from "../cards";
import { Icons } from "../icons";

type ImageCarouselProps = {
  images: string[];
  height?: number;
};

export const ImageCarousel = ({ images, height = 250 }: ImageCarouselProps) => {
  const [index, setIndex] = useState(0);
  const image = images.length === 0 ? undefined : images[index];
  const last = () =>
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const next = () =>
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  return (
    <div className="full space-y-3.75">
      <div style={{ height }} className="">
        <ImageCard src={image} />
      </div>
      {images.length > 1 && (
        <div className="flex flex-row justify-between items-center">
          <IconButton onClick={last} name={Icons.ChevronLeft} />

          <div className="">
            <p className="text-sm text-secondary-50">
              {index + 1} of {images.length}
            </p>
          </div>

          <IconButton onClick={next} name={Icons.Chevron} />
        </div>
      )}
    </div>
  );
};
