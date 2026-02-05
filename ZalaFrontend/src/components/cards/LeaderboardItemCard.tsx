import clsx from "clsx";
import { ordinals } from "../../utils";

type LeaderboardItemCardProps = {
  title: string;
  xp: number;
  place: number;
  onClick?: () => void;
};

export const LeaderboardItemCard = ({
  title,
  xp,
  place,
  onClick,
}: LeaderboardItemCardProps) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "flex flex-row justify-between items-center card-base-secondary box-shadow p-[15px]",
        onClick ? "cursor-pointer" : "",
      )}
    >
      <div>
        <p className="text-lg font-bold text-secondary">{title}</p>
        <p className="text-sm font-bold text-secondary-50">{xp} XP</p>
      </div>
      <p className="text-lg font-bold text-secondary">{ordinals(place)}</p>
    </div>
  );
};
