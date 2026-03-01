import { useState } from "react";
import { useAllBoardsPage, useDashboardPage } from "../../../hooks";
import { ModalHeader } from "../../headers";
import { Icons } from "../../icons";
import { ModalCenterButtons } from "../../buttons";
import { TextInput } from "../../inputs";
import { DashboardModalPages, useDashboardModalStore } from "../../../stores";

type CreateBoardModalProps = {
  onClose?: () => void;
  onConfirm: () => void;
};

export const CreateBoardModal = ({
  onClose,
  onConfirm,
}: CreateBoardModalProps) => {
  const { createBoard } = useAllBoardsPage();
  const { page } = useDashboardModalStore();
  const { linkTeamBoard } = useDashboardPage();

  const [boardTitle, setBoardTitle] = useState("");

  const isTeamBoard = page === DashboardModalPages.CreateTeamBoardModal;

  const onSubmit = async () => {
    const kanbanBoard = await createBoard(
      boardTitle.length > 0 ? boardTitle : undefined,
    );
    if (isTeamBoard && kanbanBoard) await linkTeamBoard(kanbanBoard.boardId);
    onConfirm();
  };
  return (
    <div className="full p-6 flex flex-col space-y-[30px]">
      <ModalHeader
        title={"Create New Board"}
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

      <div className="grow-1 flex flex-col items-center justify-center">
        <div className="w-[75%]">
          <TextInput
            optional={boardTitle.length === 0}
            label="Board Title"
            placeholder="*Optional*"
            value={boardTitle}
            setValue={setBoardTitle}
          />
        </div>
      </div>

      <ModalCenterButtons
        primary={{
          text: "Create board",
          onClick: onSubmit,
        }}
      />
    </div>
  );
};
