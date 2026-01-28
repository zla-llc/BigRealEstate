import React, { useRef } from "react";
import { IconButton, IconButtonVariant } from "../buttons";
import { Icons } from "../icons";
import clsx from "clsx";
import { useOnKeyPress, type UseOnKeyPressProps } from "../../hooks";
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

  onKeyPressProps?: UseOnKeyPressProps;
  errorMsg?: string;
};

export const TextInput = ({
  label,
  secure,
  type,
  optional,
  placeholder,
  value,
  setValue,

  icon,
  flatIcon,
  iconVariant = IconButtonVariant.Secondary,
  onIconPress,

  onKeyPressProps = {},
  errorMsg,
}: TextInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const onKeyPress = useOnKeyPress(onKeyPressProps);

  const onChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => setValue && setValue(value);

  return (
    <div className="space-y-[5px]">
      <div
        className={clsx(
          "flex flex-row relative rounded-[15px] border-2 box-shadow-sm",
          "bg-white focus-within:border-accent",
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
            "px-2.5 cursor-text",
            "focus:outline-none",
            "placeholder:text-secondary-50",
            optional ? "text-secondary-50" : "text-secondary",
          )}
          type={secure ? "password" : (type ?? "text")}
          placeholder={label ? "" : placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyPress}
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
          <Label
            optional={optional}
            label={label}
            active={value && value.length > 0 ? true : false}
          />
        )}

        <div className="absolute top-0 left-0 bottom-0 right-0 pointer-events-none bg-secondary opacity-0 peer-hover:opacity-5"></div>
      </div>
      {errorMsg && (
        <p className="pl-[15px] text-error text-base">* {errorMsg}</p>
      )}
    </div>
  );
};
