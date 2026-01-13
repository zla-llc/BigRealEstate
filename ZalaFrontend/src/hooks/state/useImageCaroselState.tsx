import { useState } from "react";
import type { IImageAsset } from "../../interfaces";
import { produce } from "immer";

const MAX_FILE_LIMIT = 4;

export const useImageCaroselState = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [deletingImageIds, setDeletingImageIds] = useState<number[]>([]);
  const [images, setImages] = useState<IImageAsset[]>([]);
  const selectedImage =
    selectedImageIndex >= 0 ? images[selectedImageIndex] : undefined;

  const onAddFiles = (filePositions: [File, number][]) => {
    setImages(
      produce((draft) => {
        const lastFile = draft.at(-1);
        let startPosition = 1;
        if (lastFile) startPosition = lastFile.order + 1; // Get last position if possible

        const indexedFiles = filePositions.map((filePositionArr, i) => ({
          order: startPosition + i,
          file: filePositionArr[0],
        })); // Adjust incoming positions

        if (!selectedImage && filePositions.length !== 0)
          setSelectedImageIndex(0);

        return [...draft, ...indexedFiles];
      })
    );
  };

  const onEditFile = (filePositions: [File, number][]) => {
    if (filePositions.length === 0) return;
    const newFilePosition = filePositions[0];

    setImages(
      produce((draft) => {
        return draft.map((dImg, i) => {
          if (i === selectedImageIndex) {
            return {
              order: dImg.order,
              file: newFilePosition[0],
              image: dImg.image,
            };
          }
          return dImg;
        });
      })
    );
  };

  const onRemoveImage = () => {
    setDeletingImageIds(
      produce((draft) => {
        if (
          selectedImage?.image?.leadImageId ||
          selectedImage?.image?.propertyImageId
        )
          draft.push(
            selectedImage?.image?.leadImageId ??
              (selectedImage?.image?.propertyImageId as number)
          );
      })
    );

    setImages(
      produce((draft) => {
        draft.splice(selectedImageIndex, 1);

        setSelectedImageIndex(draft.length > 0 ? 0 : -1);
      })
    );
  };

  return {
    MAX_FILE_LIMIT,

    selectedImageIndex,
    setSelectedImageIndex,
    deletingImageIds,
    setDeletingImageIds,
    images,
    setImages,
    selectedImage,

    onAddFiles,
    onEditFile,
    onRemoveImage,
  };
};
