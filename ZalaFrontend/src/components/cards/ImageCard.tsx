import { Icon, Icons } from "../icons";

type ImageCardProps = {
  src?: string;
  alt?: string;
};

export const ImageCard = ({ src, alt }: ImageCardProps) => {
  return src ? (
    <img className="rounded-xl full object-cover" src={src} alt={alt} />
  ) : (
    <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
      <Icon name={Icons.Image} scale={1.75} />
    </div>
  );
};
