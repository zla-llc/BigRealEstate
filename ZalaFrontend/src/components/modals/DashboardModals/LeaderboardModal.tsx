import { Icons } from "../../icons";
import {
  useDashboardModalStore,
  useLeaderboardModalStore,
} from "../../../stores";
import { ModalHeader } from "../../headers";
import { LeaderboardItemCard } from "../../cards";

export const LeaderboardModal = () => {
  const { title, items, onItemClick } = useLeaderboardModalStore();
  const toggleModalOpen = useDashboardModalStore((state) => state.toggle);
  return (
    <div className="full p-6 flex flex-col space-y-[30px]">
      <ModalHeader
        title={title}
        actions={[
          {
            type: "iconBtn",
            side: "left",
            iconBtnProps: {
              name: Icons.Close,
              onClick: () => toggleModalOpen(false),
            },
          },
        ]}
      />

      <div className="grow-1 px-[15px] pr-[30px] overflow-y-scroll space-y-[30px]">
        {items.map((item, i) => (
          <LeaderboardItemCard
            key={item.id}
            title={item.title}
            xp={item.xp}
            place={i + 1}
            onClick={() => onItemClick(item.id)}
          />
        ))}

        <div className="opacity-0">
          <LeaderboardItemCard title="" xp={0} place={0} />
        </div>
      </div>
    </div>
  );
};
