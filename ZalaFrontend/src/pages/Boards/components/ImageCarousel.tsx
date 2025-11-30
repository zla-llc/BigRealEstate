import { useRef, useMemo } from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, Upload, Image, Trash2, X } from "lucide-react";
import type { GalleryImage, PendingImage } from "./types";

export interface ImageCarouselProps {
  images: GalleryImage[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onDelete: (imageId: number) => void;
  busy: boolean;
  pendingImages: PendingImage[];
  onAddPendingImages: (files: File[]) => void;
  onRemovePendingImage: (index: number) => void;
  onSavePendingImages: () => Promise<void>;
}

export const ImageCarousel = ({
  images,
  currentIndex,
  onIndexChange,
  onDelete,
  busy,
  pendingImages,
  onAddPendingImages,
  onRemovePendingImage,
  onSavePendingImages,
}: ImageCarouselProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Combine existing images with pending previews for display
  const allImages = useMemo(() => {
    const existing = images.map((img) => ({
      ...img,
      isPending: false as const,
      pendingIndex: -1,
    }));
    const pending = pendingImages.map((p, idx) => ({
      url: p.previewUrl,
      id: undefined as number | undefined,
      isPending: true as const,
      pendingIndex: idx,
    }));
    return [...existing, ...pending];
  }, [images, pendingImages]);

  const handlePrev = () => {
    onIndexChange(currentIndex === 0 ? allImages.length - 1 : currentIndex - 1);
  };

  const handleNext = () => {
    onIndexChange(currentIndex === allImages.length - 1 ? 0 : currentIndex + 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onAddPendingImages(Array.from(files));
    }
    e.target.value = "";
  };

  const currentImage = allImages[currentIndex];
  const isPendingImage = currentImage?.isPending === true;

  return (
    <div className="space-y-3">
      <div className="relative bg-secondary-50/10 rounded-lg overflow-hidden">
        {allImages.length > 0 ? (
          <>
            <img
              src={allImages[currentIndex]?.url}
              alt={`Image ${currentIndex + 1}`}
              className="w-full h-64 object-contain"
            />
            {isPendingImage && (
              <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-lg font-medium">
                Pending Upload
              </span>
            )}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => onIndexChange(idx)}
                      className={clsx(
                        "w-2 h-2 rounded-full transition-colors",
                        idx === currentIndex
                          ? "bg-white"
                          : "bg-white/50 hover:bg-white/75",
                        img.isPending && "ring-2 ring-amber-400"
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="h-48 flex items-center justify-center text-secondary-50">
            <div className="text-center">
              <Image size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No images yet</p>
            </div>
          </div>
        )}
      </div>

      {/* Pending images thumbnails */}
      {pendingImages.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-amber-600">
            {pendingImages.length} image{pendingImages.length > 1 ? "s" : ""}{" "}
            ready to upload
          </p>
          <div className="flex flex-wrap gap-2">
            {pendingImages.map((pending, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={pending.previewUrl}
                  alt={`Pending ${idx + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border-2 border-amber-400 cursor-pointer"
                  onClick={() => onIndexChange(images.length + idx)}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePendingImage(idx);
                  }}
                  className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={onSavePendingImages}
            disabled={busy}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Upload size={16} />
            Upload {pendingImages.length} Image
            {pendingImages.length > 1 ? "s" : ""}
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-sm font-medium disabled:opacity-50"
        >
          <Upload size={16} />
          Add Images
        </button>
        {allImages.length > 0 &&
          currentImage &&
          (isPendingImage ? (
            <button
              onClick={() => onRemovePendingImage(currentImage.pendingIndex)}
              disabled={busy}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <Trash2 size={16} />
              Remove
            </button>
          ) : currentImage.id ? (
            <button
              onClick={() => onDelete(currentImage.id!)}
              disabled={busy}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <Trash2 size={16} />
              Delete Image
            </button>
          ) : null)}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {allImages.length > 1 && (
        <p className="text-xs text-secondary-50 text-center">
          Image {currentIndex + 1} of {allImages.length}
          {pendingImages.length > 0 && ` (${pendingImages.length} pending)`}
        </p>
      )}
    </div>
  );
};
