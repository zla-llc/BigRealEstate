import { useCallback } from "react";
import { useAuthStore, useBoardSettingsStore, useBoardStore, useSideNavControlStore } from "../../../stores";
import type { IBoardType } from "../../../interfaces";
import { useApi } from "../../api";

export const useBoardSettingsSidenav = () => {
  const sidenavFuncs = useSideNavControlStore();
  const boardSettingsState = useBoardSettingsStore();
  const {board} = useBoardStore()
  const {user} = useAuthStore()
  const {updateBoard} = useApi();
  const onSwitchClick = useCallback(
    (type: IBoardType) => async () => {
      if (boardSettingsState.boardTypeDisabled || !board || !user) {
        return;
      }
      boardSettingsState.setBoardType(type);
      await updateBoard({boardId: board.boardId, boardName: board.boardName, boardType: type as string, userId: user.userId})
    },
    [boardSettingsState.boardTypeDisabled, boardSettingsState.setBoardType]
  );

  const closeSidenav = () => {
    sidenavFuncs.close();
  };

  const onSave = () => {
    boardSettingsState.onSave();
    closeSidenav();
  };

  return {
    ...boardSettingsState,
    onSwitchClick,
    closeSidenav,
    onSave,
  };
};
