import { useState } from "react";
import { useAllBoardsPage } from "../../../hooks";
import { ModalHeader } from "../../headers";
import { Icons } from "../../icons";
import { ModalCenterButtons } from "../../buttons";
import { TextInput } from "../../inputs";

type CreateBoardModalProps = {
  onClose?: () => void;
  onConfirm: () => void;
};

export const CreateBoardModal = ({
  onClose,
  onConfirm,
}: CreateBoardModalProps) => {
  const { createBoard } = useAllBoardsPage();
  const [boardTitle, setBoardTitle] = useState("");
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
          onClick: async () => (
            await createBoard(boardTitle.length > 0 ? boardTitle : undefined),
            onConfirm()
          ),
        }}
      />
    </div>
  );
};
