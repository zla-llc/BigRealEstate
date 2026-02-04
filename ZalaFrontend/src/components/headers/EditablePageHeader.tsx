import clsx from "clsx";
import { EditablePageHeaderSize, type Actions } from "./types";
import { HeaderActions } from "./HeaderActions";

export type EditablePageHeaderProps = {
  value: string;
  setValue: (v: string) => void;

  actions?: (Actions | null)[];

  editable?: boolean;
  centerText?: boolean;
  size?: EditablePageHeaderSize;
  disablePadding?: boolean;
};

export const EditablePageHeader = ({
  value,
  setValue,

  actions = [],

  editable = true,
  centerText,
  size = EditablePageHeaderSize.Large,
  disablePadding,
}: EditablePageHeaderProps) => {
  const textSize =
    size === EditablePageHeaderSize.Large
      ? "!text-2xl"
      : size === EditablePageHeaderSize.Medium
      ? "text-xl"
      : "text-lg";
  const centerStyle = centerText ? "text-center" : "";
  return (
    <div
      className={clsx(
        "flex flex-row w-full",
        disablePadding ? "" : "px-[30px] py-[15px]",
        actions.length == 0 ? "" : "gap-[15px]"
      )}
    >
      <HeaderActions side="left" actions={actions} />
      {editable ? (
        <input
          className={clsx(
            "border-text-input w-full py-[5px] line-clamp-1",
            textSize,
            centerStyle
          )}
          placeholder="Campaign Title"
          value={value}
          onChange={({ currentTarget: { value } }) => setValue(value)}
        />
      ) : (
        <p
          className={clsx(
            "border-text-input w-full py-[5px] line-clamp-1 cursor-default",
            textSize,
            centerStyle
          )}
        >
          {value}
        </p>
      )}
      <HeaderActions side="right" actions={actions} />
    </div>
  );
};
