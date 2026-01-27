import type { IconButtonProps } from "../buttons";
import type { IconProps } from "../icons";

export enum EditablePageHeaderSize {
  Large = "Large",
  Medium = "Medium",
  Small = "Small",
}

type ActionType = "icon" | "iconBtn" | "invisible";
export type ActionSide = "left" | "right";

export type Actions = {
  type: ActionType;
  side: ActionSide;
  iconBtnProps?: IconButtonProps;
  iconProps?: IconProps;
};
