import clsx from "clsx";
import { useState } from "react";
import { useIsClamped } from "../../hooks";
import type { ITeamAnnouncement } from "../../interfaces";
import { IconButton, IconButtonVariant } from "../buttons";
import { Icons } from "../icons";
import moment from "moment";

type AnnouncementCardProps = {
  message: ITeamAnnouncement;
  onClick?: () => void;
  onTrash?: () => void;
  onEdit?: () => void;
};

export const AnnouncementCard = ({
  message,
  onClick,
  onTrash,
  onEdit,
}: AnnouncementCardProps) => {
  const [ref, isClamped] = useIsClamped();
  const [showMore, setShowMore] = useState(false);

  return (
    <div
      className={clsx(
        "group relative flex flex-col box-shadow p-[15px] card-base",
        "!bg-white border-2 border-secondary",
        onClick ? "hover:-translate-y-[5px]" : "",
      )}
      onClick={onClick}
    >
      <div className="flex flex-row justify-between items-center">
        <p className="text-lg text-secondary">{message.title}</p>

        <div
          className={clsx(
            "flex flex-row transition-opacity duration-75 opacity-0 space-x-[15px]",
            onEdit || onTrash ? "group-hover:!opacity-100" : "",
          )}
        >
          {onEdit && (
            <IconButton
              name={Icons.Edit}
              variant={IconButtonVariant.Secondary}
              onClick={onEdit}
            />
          )}
          <IconButton
            name={Icons.Trash}
            variant={IconButtonVariant.Secondary}
            onClick={onTrash}
          />
        </div>
      </div>

      <div className="">
        <div
          ref={ref}
          className="absolute opacity-0 pointer-events-none text-md text-secondary-50 line-clamp-3"
          dangerouslySetInnerHTML={{ __html: message.message }}
        />
        <div
          className={clsx(
            "text-md text-secondary-50 group-hover:text-secondary",
            showMore ? "" : "line-clamp-3",
          )}
          dangerouslySetInnerHTML={{ __html: message.message }}
        />
      </div>

      <div className="w-full flex flex-row justify-between">
        <p className="text-sm text-secondary-50">
          {moment(message.created_at).fromNow()}
        </p>
        {isClamped && (
          <p
            className="hover:font-bold cursor-pointer text-lg text-accent"
            onClick={() => setShowMore((prev) => !prev)}
          >
            See {showMore ? "less" : "more"}
          </p>
        )}
      </div>
    </div>
  );
};
