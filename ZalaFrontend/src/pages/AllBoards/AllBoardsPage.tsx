import { useAllBoardsPage } from "../../hooks";
import {
  BoardCard,
  BoardModal,
  Button,
  ButtonVariant,
  EditablePageHeader,
  IconButtonVariant,
  Icons,
} from "../../components";
import { CSSVars } from "../../config";
import { AnimatePresence, motion } from "motion/react";
import clsx from "clsx";

const gridVariant = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.25,
    },
  },
  exit: {},
};

const childVariant = {
  initial: {
    ...CSSVars.animate.presence.initial,
  },
  animate: {
    ...CSSVars.animate.presence.animate,
    transition: {
      duration: 0.5,
    },
  },
  exit: {
    ...CSSVars.animate.presence.initial,
  },
};

export const AllBoardsPage = () => {
  const {
    scope,
    animationRunning,
    rewindAnimation,

    boards,
    selectedBoard,
    selectBoard,

    selectedBoardName,
    setSelectedBoardName,

    stepName,
    stepNameId,

    createdBoard,

    getBoards,

    onAddNewBoardBtn,
    onDeleteBoardBtn,
    onStepNameChange,
    onAddBoardStep,
    onRemoveBoardStep,
    onSettingsBtn,
  } = useAllBoardsPage();

  return (
    <div ref={scope} className="full relative overflow-hidden ">
      <div id="grid-container" className="">
        <div className="w-full">
          <EditablePageHeader
            value="My Boards"
            centerText
            setValue={() => {}}
            editable={false}
            actions={[
              {
                type: "iconBtn",
                side: "right",
                iconBtnProps: {
                  name: Icons.Add,
                  variant: IconButtonVariant.Secondary,
                  scale: CSSVars.icons.scale.normal,
                  onClick: onAddNewBoardBtn,
                },
              },
            ]}
          />
        </div>

        <div className="w-full p-[60px] flex justify-center items-center overflow-y-scroll">
          {boards.length > 0 && (
            <motion.div
              className="w-full grid grid-cols-3 gap-[60px]"
              variants={gridVariant}
              initial="initial"
              animate="animate"
            >
              <AnimatePresence initial={true}>
                {boards.map((board) => (
                  <motion.div
                    key={board.boardId}
                    exit={CSSVars.animate.presence.out}
                    transition={{
                      duration: 0.25,
                    }}
                    className="flex justify-center items-center scale-100 opacity-100"
                  >
                    <motion.div
                      variants={childVariant}
                      initial={
                        createdBoard === board.boardId
                          ? CSSVars.animate.presence.initial
                          : undefined
                      }
                      animate={
                        createdBoard === board.boardId
                          ? CSSVars.animate.presence.animate
                          : undefined
                      }
                      transition={
                        createdBoard === board.boardId
                          ? {
                              duration: 0.5,
                            }
                          : undefined
                      }
                    >
                      <BoardCard
                        key={board.boardId}
                        componentId={`grid-board-${board.boardId}`}
                        board={board}
                        onClick={selectBoard(board)}
                      />
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      <div
        id="travel-container"
        className="absolute pointer-events-none opacity-0"
      >
        {selectedBoard && (
          <BoardCard
            componentId={`travel-board-${selectedBoard.boardId}`}
            board={selectedBoard}
          />
        )}
      </div>

      <div
        id="add-step-container"
        className="absolute pointer-events-none bottom-0 left-0 right-0 z-[2] flex flex-row justify-end pb-[30px] pr-[30px] opacity-0"
      >
        <div className="flex-[.15] pointer-events-auto flex justify-center items-center flex-row">
          <Button
            variant={ButtonVariant.Primary}
            text="Add Step"
            icon={Icons.Add}
            onClick={onAddBoardStep}
          />
        </div>
      </div>

      <div
        id="grow-container"
        className={clsx("absolute pointer-events-auto opacity-0")}
      >
        {selectedBoard && (
          <BoardCard
            componentId={`expanded-board`}
            board={selectedBoard}
            expandable={{
              expanded: !animationRunning,
              boardName: selectedBoardName,
              stepName,
              stepNameId,
              onBoardStepNameChange: onStepNameChange,
              onBoardNameChange: setSelectedBoardName,
              onBackBtn: rewindAnimation,
              onTrashBtn: onDeleteBoardBtn,
              onDeleteStep: onRemoveBoardStep,
              onSettingsBtn,
              reloadBoards: getBoards,
            }}
          />
        )}
      </div>

      <BoardModal onAddLeads={() => getBoards()} />
    </div>
  );
};
