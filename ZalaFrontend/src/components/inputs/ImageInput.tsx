import { ImageInputSize } from "./types";
import clsx from "clsx";
import { Icon, Icons } from "../icons";
import { useHover } from "../../hooks";
import { COLORS } from "../../config";
import { useRef, useState } from "react";

type ImageInputProps = {
  url?: string;
  alt?: string;
  file?: File;
  fileLimit?: number;
  size?: ImageInputSize;
  opensFileSelect?: boolean;
  forceActive?: boolean;
  onFileSelect?: (v: [File, number][]) => void;
  onClick?: () => void;
};

export const ImageInput = ({
  url,
  alt,
  file,
  size = ImageInputSize.Large,
  fileLimit = 1,
  opensFileSelect = true,
  forceActive,
  onClick,
  onFileSelect = () => {},
}: ImageInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isHovered, hoverProps] = useHover();
  const [inputKey, setInputKey] = useState(Math.random().toString(36));

  const isLargeSize = size === ImageInputSize.Large;
  const isStateActive =
    isHovered && (onClick || opensFileSelect) ? true : false;
  const isActive = forceActive || isStateActive ? true : false;

  const showImage = file || url ? true : false;

  const stroke = isActive ? `%23FA6F1EFF` : "black";
  const backgroundImage = file
    ? undefined
    : isLargeSize
    ? `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='15' ry='15' stroke='${stroke}' stroke-width='10' stroke-dasharray='40%2c 20' stroke-dashoffset='26' stroke-linecap='square'/%3e%3c/svg%3e")`
    : `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='15' ry='15' stroke='${stroke}' stroke-width='7' stroke-dasharray='10%2c 10' stroke-dashoffset='26' stroke-linecap='square'/%3e%3c/svg%3e")`;

  const onContainerClick = () => {
    if (opensFileSelect) inputRef.current?.click();
    if (onClick) onClick();
  };

  const onInputChange = ({
    currentTarget: { files },
  }: React.ChangeEvent<HTMLInputElement>) => {
    const list = [];
    for (let i = 0; i < fileLimit; i++) {
      const file = files?.item(i) ?? undefined;
      if (file) list.push(file);
    }
    onFileSelect(list.map((file) => [file, -1]));
    setInputKey(Math.random().toString(36));
  };

  return (
    <div
      {...hoverProps}
      style={{
        backgroundImage,
      }}
      className={clsx(
        "w-full h-full rounded-[15px] relative overflow-hidden",
        "flex items-center justify-center",
        showImage && isActive ? "border-4 border-accent" : "",
        isActive ? "cursor-pointer" : ""
      )}
      onClick={onContainerClick}
    >
      {opensFileSelect && (
        <input
          key={inputKey}
          ref={inputRef}
          type={"file"}
          accept="image/*"
          multiple={fileLimit > 1}
          className="absolute top-0 right-0 opacity-0"
          onChange={onInputChange}
        />
      )}

      {file ? (
        <img
          className="full object-cover"
          src={URL.createObjectURL(file)}
          alt={file.name}
        />
      ) : url ? (
        <img className="full object-cover" src={url} alt={alt} />
      ) : (
        <div
          className={clsx(
            "flex flex-col items-center justify-center",
            isLargeSize ? "space-y-[15px]" : ""
          )}
        >
          <Icon
            name={Icons.Upload}
            scale={isLargeSize ? 2.5 : undefined}
            color={isActive ? COLORS.accent : undefined}
          />
          {isLargeSize && (
            <span className={clsx(isActive ? "text-accent" : "")}>
              Upload Image
            </span>
          )}
        </div>
      )}

      {showImage && isStateActive && isLargeSize && (
        <div className="absolute-fill bg-secondary-50/50 flex items-center justify-center">
          <Icon
            name={Icons.Upload}
            scale={isLargeSize ? 2.5 : undefined}
            color={COLORS.white}
          />
        </div>
      )}
    </div>
  );
};
