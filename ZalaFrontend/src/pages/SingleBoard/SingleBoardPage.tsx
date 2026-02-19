import { useEffect } from "react";
import { useParams } from "react-router";
import { useAllBoardsPage, useAppNavigation } from "../../hooks";
import { LoadingPage } from "../Loading";
import { BoardCard, BoardModal } from "../../components";
import transition from "../../utils/transitions/transition";

const SingleBoardPage = () => {
  const routeParams = useParams();
  const boardId = parseInt(routeParams?.boardId ?? `-1`);

  const {
    boards,
    selectedBoard,
    setSelectedBoard,
    selectedBoardName,
    setSelectedBoardName,
    stepName,
    stepNameId,
    getBoards,
    onDeleteBoardBtn,
    onStepNameChange,
    onRemoveBoardStep,
    onSettingsBtn,
  } = useAllBoardsPage();

  const { goBack } = useAppNavigation();

  useEffect(() => {
    if (boards.length <= 0) return;
    const board = boards.find((board) => board.boardId === boardId);
    if (board) setSelectedBoard(board);
  }, [boards.length]);

  if (!selectedBoard?.boardId) return <LoadingPage text="" />;

  return (
    <div className="flex flex-col gap-y-[60px] flex-1 overflow-y-scroll">
      <BoardCard
        board={selectedBoard}
        expandable={{
          expanded: true,
          boardName: selectedBoardName,
          stepName,
          stepNameId,
          onBoardStepNameChange: onStepNameChange,
          onBoardNameChange: setSelectedBoardName,
          onTrashBtn: onDeleteBoardBtn,
          onBackBtn: goBack,
          onDeleteStep: onRemoveBoardStep,
          onSettingsBtn,
          reloadBoards: getBoards,
        }}
      />

      <BoardModal onAddLeads={() => getBoards()} />
    </div>
  );
};

export default transition(SingleBoardPage);