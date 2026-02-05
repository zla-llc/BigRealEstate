import clsx from "clsx";

type AvatarCardProps = {
  title: string;
  size?: number;
  onClick?: () => void;
  hoverable?: boolean;
};

export const AvatarCard = ({
  onClick,
  hoverable,
  title,
  size = 75,
}: AvatarCardProps) => {
  const avatarSize = size;
  return (
    <div
      onClick={onClick}
      style={{
        minWidth: avatarSize,
        height: avatarSize,
        borderRadius: avatarSize,
      }}
      className={clsx(
        "flex items-center justify-center card-base-secondary text-xl font-bold",
        hoverable || onClick ? "cursor-pointer" : "",
      )}
    >
      {title}
    </div>
  );
};
