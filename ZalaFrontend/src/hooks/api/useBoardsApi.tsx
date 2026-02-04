import type {
  APIHookProps,
  CreateBoardProps,
  CreateBoardStepProps,
  UpdateBoardProps,
} from "./types";
import { useFetch } from "./useFetch";
import type { ABoardStepCard, AKanbanBoard } from "../../interfaces/BoardV2";

export const useBoardsApi = ({ getSignal }: APIHookProps) => {
  const { post, get, put, del } = useFetch();

  const getUserBoards = async () => {
    // TODO: Should we send in user id so that we only get current user's boards
    return await get<AKanbanBoard[]>(
      `/api/boards?limit=50`,
      getSignal("getUserBoards")
    );
  };

  const createBoard = async ({ boardName, userId }: CreateBoardProps) => {
    return await post<AKanbanBoard>(
      `/api/boards`,
      {
        user_id: userId,
        board_name: boardName,
      },
      { signal: getSignal("createBoard") }
    );
  };

  const createBoardStep = async ({
    boardId,
    boardColumn,
    stepName,
  }: CreateBoardStepProps) => {
    return await post<ABoardStepCard>(`/api/board-steps`, {
      board_id: boardId,
      board_column: boardColumn,
      step_name: stepName,
    });
  };

  const updateBoardStepName = async ({
    stepId,
    name,
  }: {
    stepId: number;
    name: string;
  }) => {
    return await put<ABoardStepCard>(
      `/api/board-steps/${stepId}`,
      {
        step_name: name,
      },
      { isFormData: false, signal: getSignal("updateBoardStepName") }
    );
  };

  const updateBoardStepLeads = async ({
    stepId,
    leadIds,
  }: {
    stepId: number;
    leadIds: number[];
  }) => {
    return await put<ABoardStepCard>(
      `/api/board-steps/${stepId}`,
      { lead_ids: leadIds },
      { isFormData: false, signal: getSignal("updateBoardStepLeads") }
    );
  };

  const updateBoardStepProperties = async ({
    stepId,
    propertyIds,
  }: {
    stepId: number;
    propertyIds: number[];
  }) => {
    return await put<ABoardStepCard>(
      `/api/board-steps/${stepId}`,
      { property_ids: propertyIds },
      { isFormData: false, signal: getSignal("updateBoardStepProperties") }
    );
  };

  const updateBoard = async ({
    boardId,
    boardName,
    userId,
  }: UpdateBoardProps) => {
    return await put<AKanbanBoard>(
      `/api/boards/${boardId}`,
      {
        user_id: userId,
        board_name: boardName,
      },
      { signal: getSignal("updateBoard") }
    );
  };

  const deleteBoard = async (boardId: number) => {
    return await del(`/api/boards/${boardId}`, getSignal("deleteBoard"));
  };

  const deleteStep = async (stepId: number) => {
    return await del<ABoardStepCard>(`/api/board-steps/${stepId}`);
  };

  return {
    getUserBoards,
    createBoard,
    createBoardStep,
    updateBoard,
    deleteBoard,
    updateBoardStepName,
    updateBoardStepLeads,
    updateBoardStepProperties,
    deleteStep,
  };
};
