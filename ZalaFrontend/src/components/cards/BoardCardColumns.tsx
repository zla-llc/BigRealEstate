import type { IBoardStepCard } from "../../interfaces";
import clsx from "clsx";
import { BoardCardColumn, type BoardEditStepProps } from "./BoardCardColumn";
import { Icons } from "../icons";
import { IconButtonVariant } from "../buttons";
import { useHover } from "../../hooks";
import { AnimatePresence, motion } from "motion/react";
import { CSSVars } from "../../config";

type BoardCardColumnsProps = {
  expanded?: boolean;
  steps: IBoardStepCard[];
  stepHeights?: (number | string)[];
  editableStep?: BoardEditStepProps;
  onDeleteStep?: (stepId: number) => void;
  onReloadBoards?: () => void;
};

export const BoardCardColumns = ({
  expanded,
  steps,
  stepHeights,
  editableStep,
  onDeleteStep = () => {},
  onReloadBoards = () => {},
}: BoardCardColumnsProps) => {
  const MappedBoardColumn = ({
    step,
    i,
    height,
  }: {
    step: IBoardStepCard;
    i: number;
    height?: number | string;
  }) => {
    const [isHovered, isHoveredProps] = useHover();
    return (
      <div {...isHoveredProps} className={clsx("flex-1")}>
        <BoardCardColumn
          key={`board-${i}`}
          step={step}
          expanded={expanded}
          height={height}
          titleProps={{
            value:
              step.boardStepId === editableStep?.stepNameId
                ? editableStep.stepName
                : step.stepName,
            onChange: (v) =>
              editableStep &&
              editableStep.onStepNameChange(v, step.boardStepId),
          }}
          actions={
            expanded && isHovered
              ? [
                  {
                    side: "right",
                    type: "iconBtn",
                    iconBtnProps: {
                      name: Icons.Trash,
                      variant: IconButtonVariant.Secondary,
                      onClick: () => onDeleteStep(step.boardStepId),
                    },
                  },
                ]
              : []
          }
          onReloadBoards={onReloadBoards}
        />
      </div>
    );
  };

  return (
    <div
      className={clsx(
        "full flex flex-row",
        "transition-[gap] duration-75",
        expanded ? "gap-7" : "gap-2"
      )}
    >
      <AnimatePresence initial={false}>
        {steps.map((step, i) => {
          const height = stepHeights ? stepHeights[i] : undefined;
          return (
            <motion.div
              initial={CSSVars.animate.presence.initial}
              animate={CSSVars.animate.presence.animate}
              exit={CSSVars.animate.presence.out}
              transition={{ duration: 0.25 }}
              className={clsx("flex-1")}
              key={`board-${i}`}
            >
              <MappedBoardColumn step={step} i={i} height={height} />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {expanded && <div className="min-w-[5vw]" />}
    </div>
  );
};
