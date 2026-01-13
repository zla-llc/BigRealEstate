import { ModalHeader } from "./ModalHeader";
import { capitalize } from "../../utils";
import { useBoardSettingsStore, useBoardStore } from "../../stores";
import type { Actions } from "./types";
import { Icons } from "../icons";

type BoardStepModalHeaderProps = {
  title?: string;
  subtitle?: React.ReactNode;
  onBackBtn?: () => void;
  onCloseBtn?: () => void;
};

export const BoardStepModalHeader = ({
  title,
  subtitle,
  onBackBtn,
  onCloseBtn,
}: BoardStepModalHeaderProps) => {
  const { boardType } = useBoardSettingsStore();
  const { step } = useBoardStore();

  const actions: (Actions | null)[] = [
    onBackBtn
      ? {
          side: "left",
          type: "iconBtn",
          iconBtnProps: { name: Icons.Back, onClick: onBackBtn },
        }
      : null,
    onCloseBtn
      ? {
          side: "left",
          type: "iconBtn",
          iconBtnProps: { name: Icons.Close, onClick: onCloseBtn },
        }
      : null,
  ];

  return (
    step && (
      <ModalHeader
        title={title ?? `Add ${capitalize(boardType)}`}
        subtitle={
          subtitle ?? (
            <span>
              to the <span className="font-bold">'{step.stepName}'</span> step
            </span>
          )
        }
        actions={actions}
      />
    )
  );
};
