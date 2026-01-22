import clsx from "clsx";
import {
  IconButton,
  IconButtonVariant,
  Icons,
  ImageInput,
  ImageInputSize,
} from "..";
import { useCallback } from "react";
import { resolveAssetUrl } from "../../utils";
import type { IImageAsset } from "../../interfaces";

type ImageCaroselInputProps = {
  selectedIndex: number;
  setSelectedIndex: (v: number) => void;

  selectedImage?: IImageAsset;
  images?: IImageAsset[];
  limit?: number;

  onAddImage?: (v: [File, number][]) => void;
  onEditImage?: (v: [File, number][]) => void;
  onRemoveImage?: () => void;
};

export const ImageCaroselInput = ({
  selectedIndex,
  setSelectedIndex,
  selectedImage,
  images = [],
  limit = 1,
  onAddImage,
  onEditImage,
  onRemoveImage,
}: ImageCaroselInputProps) => {
  const toUrl = useCallback(resolveAssetUrl, [resolveAssetUrl]);
  const allowedNumFiles = limit - images.length;
  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-[15px]">
      <div className="flex flex-col justify-center items-center relative">
        {selectedImage && onRemoveImage && (
          <div className="absolute z-2 top-0 right-0 -translate-y-[50%] translate-x-[50%]">
            <IconButton
              name={Icons.Trash}
              variant={IconButtonVariant.Destructive}
              onClick={onRemoveImage}
            />
          </div>
        )}

        <div className="w-[250px] h-[250px]">
          <ImageInput
            file={selectedImage?.file}
            url={toUrl(selectedImage?.image?.imageUrl)}
            fileLimit={images.length > 0 ? 1 : limit}
            onFileSelect={selectedImage ? onEditImage : onAddImage}
            forceActive={selectedImage ? true : false}
          />
        </div>
      </div>

      {images.length > 0 && (
        <div
          className={clsx("w-full flex flex-row justify-center space-x-[15px]")}
        >
          {images.length !== limit && (
            <div className="w-[75px] h-[75px]">
              <ImageInput
                fileLimit={limit - images.length}
                opensFileSelect={allowedNumFiles > 0}
                size={ImageInputSize.Small}
                onFileSelect={onAddImage}
              />
            </div>
          )}
          {images.map((img, i) => (
            <div key={`img-${img.order}`} className="w-[75px] h-[75px]">
              <ImageInput
                file={img.file}
                url={toUrl(img.image?.imageUrl)}
                size={ImageInputSize.Small}
                opensFileSelect={false}
                onClick={() => setSelectedIndex(i)}
                forceActive={i === selectedIndex}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
