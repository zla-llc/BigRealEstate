import clsx from "clsx";
import {
  EditablePageHeaderSize,
  EditablePageHeaderVariant,
  type Actions,
} from "./types";
import { HeaderActions } from "./HeaderActions";
import { TextInput, type TextInputProps } from "../inputs";
import { forwardRef } from "react";

export type EditablePageHeaderProps = {
  value: string;
  setValue: (v: string) => void;

  title?: string;
  nonEditableText?: string;
  actions?: (Actions | null)[];
  inputProps?: TextInputProps;
  variant?: EditablePageHeaderVariant;

  editable?: boolean;
  hideInput?: boolean;
  centerText?: boolean;
  size?: EditablePageHeaderSize;
  disablePadding?: boolean;
  transparent?: boolean;
};

export const EditablePageHeader = forwardRef<
  HTMLDivElement,
  EditablePageHeaderProps
>(
  (
    {
      title = "Title:",
      nonEditableText,

      value,
      setValue,

      actions = [],
      inputProps,
      variant = EditablePageHeaderVariant.Card,

      editable = true,
      hideInput = false,
      centerText,
      size = EditablePageHeaderSize.Large,
      disablePadding,
      transparent,
    },
    ref,
  ) => {
    const textSize =
      size === EditablePageHeaderSize.Large
        ? "!text-2xl"
        : size === EditablePageHeaderSize.Medium
          ? "text-xl"
          : "text-lg";
    const centerStyle = centerText ? "text-center" : "";

    if (variant === EditablePageHeaderVariant.Card)
      return (
        <div
          ref={ref}
          className={clsx(
            "flex flex-col w-full h-min gap-y-[15px]",
            transparent ? "" : "card-base box-shadow",
            disablePadding ? "" : "p-[30px]",
          )}
        >
          <div
            className={clsx(
              "flex flex-row items-center justify-center",
              actions.length == 0 ? "" : "gap-[15px]",
            )}
          >
            <HeaderActions side="left" actions={actions} />
            <div className="w-full flex flex-row items-center justify-center">
              <p
                className={clsx(
                  "color-secondary",
                  !editable && nonEditableText
                    ? "text-md"
                    : "text-lg font-bold",
                )}
              >
                {title}
              </p>
            </div>
            <HeaderActions side="right" actions={actions} />
          </div>

          {!hideInput && (
            <TextInput
              value={value}
              setValue={setValue}
              disabled={!editable}
              {...inputProps}
            />
          )}
        </div>
      );

    return (
      <div
        ref={ref}
        className={clsx(
          "flex flex-row w-full",
          disablePadding ? "" : "px-[30px] py-[15px]",
          actions.length == 0 ? "" : "gap-[15px]",
        )}
      >
        <HeaderActions side="left" actions={actions} />
        {editable ? (
          <input
            className={clsx(
              "border-text-input w-full py-[5px] line-clamp-1",
              textSize,
              centerStyle,
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
              centerStyle,
            )}
          >
            {value}
          </p>
        )}
        <HeaderActions side="right" actions={actions} />
      </div>
    );
  },
);
