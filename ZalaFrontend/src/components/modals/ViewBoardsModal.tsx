import { ModalHeader } from "../headers";
import { useViewBoardsModalStore } from "../../stores";
import { Icons } from "../icons";
import { BoardCardV2 } from "../cards";

type ViewBoardsModalProps = {
  onClose?: () => void;
};

export const ViewBoardsModal = ({ onClose }: ViewBoardsModalProps) => {
  const { title, boards, onClick } = useViewBoardsModalStore();
  return (
    <div className="full p-6 flex flex-col space-y-[30px]">
      <ModalHeader
        title={title ?? "View Boards"}
        actions={[
          onClose
            ? {
                type: "iconBtn",
                side: "left",
                iconBtnProps: {
                  name: Icons.Close,
                  onClick: onClose,
                },
              }
            : null,
        ]}
      />

      <div className="grid grid-cols-2 gap-[30px]">
        {boards.map((board) => (
          <BoardCardV2
            key={board.boardId}
            board={board}
            onClick={() => onClick(board.boardId)}
          />
        ))}
      </div>
    </div>
  );
};
