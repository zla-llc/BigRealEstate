import { useCallback } from "react";
import { useBoardSettingsStore, useSideNavControlStore } from "../../../stores";
import type { IBoardType } from "../../../interfaces";

export const useBoardSettingsSidenav = () => {
  const sidenavFuncs = useSideNavControlStore();
  const boardSettingsState = useBoardSettingsStore();

  const onSwitchClick = useCallback(
    (type: IBoardType) => () => {
      if (boardSettingsState.boardTypeDisabled) {
        return;
      }
      boardSettingsState.setBoardType(type);
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
