import React, { forwardRef, useRef } from "react";
import { IconButton, IconButtonVariant } from "../buttons";
import { Icons } from "../icons";
import clsx from "clsx";
import {
  useBoolean,
  useOnKeyPress,
  type UseOnKeyPressProps,
} from "../../hooks";
import { Label } from "./Label";

export type TextInputProps = {
  value?: string;
  setValue?: (v: string) => void;

  icon?: Icons;
  flatIcon?: boolean;
  iconVariant?: IconButtonVariant;
  onIconPress?: () => void;

  label?: string;
  placeholder?: string;
  secure?: boolean;
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
  optional?: boolean;
  disabled?: boolean;

  onKeyPressProps?: UseOnKeyPressProps;
  errorMsg?: string;
};

export const TextInput = forwardRef<HTMLDivElement, TextInputProps>(
  (
    {
      label,
      secure,
      type,
      optional,
      placeholder,
      value,
      disabled,
      setValue,

      icon,
      flatIcon,
      iconVariant = IconButtonVariant.Secondary,
      onIconPress,

      onKeyPressProps = {},
      errorMsg,
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const onKeyPress = useOnKeyPress(onKeyPressProps);

    const onChange = ({
      target: { value },
    }: React.ChangeEvent<HTMLInputElement>) => setValue && setValue(value);

    const [isFocused, _, __, toggleFocus] = useBoolean();

    const isLabelActive =
      isFocused || (value && value.length > 0) ? true : false;

    return (
      <div ref={ref} className="space-y-1.25">
        <div
          className={clsx(
            "flex flex-row relative rounded-[15px] border-2 box-shadow-sm",
            "bg-white focus-within:border-accent",
            disabled ? "cursor-not-allowed" : "",
            errorMsg
              ? "border-error"
              : optional
                ? "border-secondary-50"
                : "border-secondary",
          )}
        >
          <input
            ref={inputRef}
            className={clsx(
              "peer flex-1 outline-none text-xl rounded-[15px]",
              "px-2.5 ",
              disabled ? "cursor-not-allowed" : "cursor-text",
              "focus:outline-none",
              "placeholder:text-secondary-50",
              optional ? "text-secondary-50" : "text-secondary",
            )}
            type={secure ? "password" : (type ?? "text")}
            placeholder={isLabelActive ? placeholder : undefined}
            value={value}
            onFocus={toggleFocus}
            onBlur={toggleFocus}
            onChange={onChange}
            onKeyDown={onKeyPress}
            disabled={disabled}
          />

          <div
            className={clsx(
              "flex items-center justify-end py-2 pr-2.5",
              icon ? "" : "opacity-0 w-0",
            )}
          >
            <IconButton
              name={icon ?? Icons.Search}
              scale={1}
              variant={iconVariant}
              onClick={onIconPress}
              shadow={!flatIcon}
            />
          </div>

          {label && (
            <Label optional={optional} label={label} active={isLabelActive} />
          )}

          <div className="absolute top-0 left-0 bottom-0 right-0 pointer-events-none bg-secondary opacity-0 peer-hover:opacity-5"></div>
        </div>
        {errorMsg && (
          <p className="pl-[15px] text-error text-base">* {errorMsg}</p>
        )}
      </div>
    );
  },
);
