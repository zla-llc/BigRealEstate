import type { Actions, ActionSide } from "./types";
import { IconButton } from "../buttons";
import { Icon } from "../icons";

type HeaderActionsProps = {
  actions?: (Actions | null)[];
  side: ActionSide;
};

export const HeaderActions = ({ actions = [], side }: HeaderActionsProps) => {
  return actions.map((action, i) =>
    action && action.side === side ? (
      action.type === "iconBtn" && action.iconBtnProps ? (
        <IconButton key={i} {...action.iconBtnProps} />
      ) : (
        action.type === "icon" &&
        action.iconProps && <Icon key={i} {...action.iconProps} />
      )
    ) : null
  );
};
