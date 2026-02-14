import { useState } from "react";
import { useIsClamped } from "../../hooks";
import { DashboardCard, type DashboardCardProps } from "./DashboardCard";
import clsx from "clsx";

type AnnouncmentsCardProps = DashboardCardProps & {
  messages: { messageId: number; title: string; message: string }[];
};

type AnnouncmentCardProps = {
  message: { messageId: number; title: string; message: string };
};

export const AnnouncmentsCard = (props: AnnouncmentsCardProps) => {
  const { messages } = props;
  return (
    <DashboardCard {...props}>
      <div className="flex flex-col gap-y-[30px]">
        {messages.map((message) => (
          <AnnouncmentCard key={message.messageId} message={message} />
        ))}
      </div>
    </DashboardCard>
  );
};

const AnnouncmentCard = ({ message }: AnnouncmentCardProps) => {
  const [ref, isClamped] = useIsClamped();
  const [showMore, setShowMore] = useState(false);
  return (
    <div className="relative flex flex-col box-shadow p-[15px] card-base !bg-white border-2 border-secondary">
      <p className="text-lg text-secondary">{message.title}</p>
      <p
        ref={ref}
        className="absolute opacity-0 pointer-events-none text-md text-secondary-50 line-clamp-3"
      >
        {message.message}
      </p>
      <p
        className={clsx(
          "text-md text-secondary-50",
          showMore ? "" : "line-clamp-3",
        )}
      >
        {message.message}
      </p>
      {isClamped && (
        <div className="w-full flex justify-end">
          <p
            className="hover:font-bold cursor-pointer text-lg text-accent"
            onClick={() => setShowMore((prev) => !prev)}
          >
            See {showMore ? "less" : "more"}
          </p>
        </div>
      )}
    </div>
  );
};
