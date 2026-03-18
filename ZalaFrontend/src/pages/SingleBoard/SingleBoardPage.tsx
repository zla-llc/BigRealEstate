import { useEffect } from "react";
import { useParams } from "react-router";
import {
  useAllBoardsPage,
  useAppNavigation,
  useBoardHighlightComponents,
  useDashboardPage,
  useShouldShowTutorial,
  useTimeoutEffect,
} from "../../hooks";
import { LoadingPage } from "../Loading";
import transition from "../../utils/transitions/transition";
import {
  BoardCard,
  BoardCardColumns,
  BoardModal,
  Button,
  ButtonVariant,
  EditablePageHeader,
  EditablePageHeaderVariant,
  Icons,
} from "../../components";
import { TutorialPage, useAuthStore } from "../../stores";

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
    boardsLoading,
    getBoards,
    onDeleteBoardBtn,
    onStepNameChange,
    onRemoveBoardStep,
    onSettingsBtn,
    onAddBoardStep,
  } = useAllBoardsPage();
  const { user } = useAuthStore();

  const { teamBoards, isUserAdmin, unlinkTeamBoard } = useDashboardPage();
  const isTeamBoard = teamBoards.current
    .map((board) => board.boardId)
    .includes(selectedBoard?.boardId ?? -1);
  const isUserBoardCreator = selectedBoard?.userId === user?.userId;

  const canUserMakeAdminChanges = isTeamBoard
    ? isUserAdmin || isUserBoardCreator
    : true;

  const { toDashboard, goBack, toNotFound } = useAppNavigation();

  const boardHighlightComponents = useBoardHighlightComponents();
  const boardHighlightRefs = boardHighlightComponents.refs;

  useShouldShowTutorial({
    page: TutorialPage.Board,
    forceWait: !selectedBoard,
    highlightComponentDims: boardHighlightComponents.highlightComponentDims,
    highlightComponentDimsChange: boardHighlightComponents.highlightComponentDimsChange,
    components: [
      null, // Step 0: Board Overview (modal)
      () => (
        <div className="w-full flex flex-row items-center px-[60px] pt-[60px]">
          <EditablePageHeader
            variant={EditablePageHeaderVariant.Card}
            value={selectedBoardName}
            setValue={() => {}}
            actions={[]}
            editable={false}
          />
        </div>
      ),
      () => (
        <div className="w-full flex flex-row items-center px-[60px] pt-[60px]">
          <EditablePageHeader
            variant={EditablePageHeaderVariant.Card}
            value={selectedBoardName}
            setValue={() => {}}
            actions={[]}
            editable={false}
          />
        </div>
      ),
      () => (
        <div className="full px-[60px]">
          <div className="full p-[30px] overflow-x-scroll">
            <BoardCardColumns
              expanded={true}
              steps={selectedBoard?.boardSteps ?? []}
            />
          </div>
        </div>
      ),
    ],
    deps: [selectedBoard?.boardId],
  });

  useEffect(() => {
    if (boards.length <= 0) return;
    const board = boards.find((board) => board.boardId === boardId);
    if (board) setSelectedBoard(board);
  }, [boards.length]);

  useTimeoutEffect(
    () => {
      if (!selectedBoard && !boardsLoading) toNotFound();
    },
    [boardsLoading, selectedBoard],
    500,
  );

  const onRemoveBoard = async () => {
    if (!selectedBoard) return;

    if (isTeamBoard) await unlinkTeamBoard(selectedBoard.boardId);

    await onDeleteBoardBtn();

    toDashboard();
  };

  if (!selectedBoard?.boardId) return <LoadingPage text="" />;

  return (
    <div className="flex relative flex-col gap-y-[60px] flex-1 overflow-y-scroll">
      <BoardCard
        board={selectedBoard}
        headerRef={boardHighlightRefs.boardHeaderRef}
        columnsRef={boardHighlightRefs.boardColumnsRef}
        expandable={{
          expanded: true,
          boardName: selectedBoardName,
          stepName,
          stepNameId,
          editable: canUserMakeAdminChanges,
          onBoardStepNameChange: onStepNameChange,
          onBoardNameChange: setSelectedBoardName,
          onTrashBtn: canUserMakeAdminChanges ? onRemoveBoard : undefined,
          onBackBtn: goBack,
          onDeleteStep: canUserMakeAdminChanges ? onRemoveBoardStep : undefined,
          onSettingsBtn: canUserMakeAdminChanges ? onSettingsBtn : undefined,
          reloadBoards: getBoards,
        }}
      />

      {canUserMakeAdminChanges && (
        <div className="fixed pointer-events-none bottom-0 left-0 right-0 z-[10] flex flex-row justify-end pb-[30px] pr-[30px]">
          <div className="flex-[.15] pointer-events-auto flex justify-center items-center flex-row">
            <Button
              variant={ButtonVariant.Primary}
              text="Add Step"
              icon={Icons.Add}
              onClick={onAddBoardStep}
            />
          </div>
        </div>
      )}

      <BoardModal onAddLeads={() => getBoards()} />
    </div>
  );
};

export default transition(SingleBoardPage);