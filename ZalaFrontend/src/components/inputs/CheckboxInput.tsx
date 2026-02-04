import clsx from "clsx";
import { Icon, Icons } from "../icons";
import { COLORS } from "../../config";

export type CheckboxInputProps = {
  checked: boolean;
  shadow?: boolean;
  text?: string;
  reverse?: boolean;
  onClick: () => void;
};

export const CheckboxInput = ({
  checked,
  shadow = true,
  text,
  reverse,
  onClick,
}: CheckboxInputProps) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "flex justify-between items-center w-full transition-colors bg-white cursor-pointer",
        "space-x-3 rounded-[15px] border-2 px-2.5 py-3 text-left box-shadow-sm",
        reverse ? "flex-row-reverse" : "flex-row",
        shadow && checked ? "box-shadow-sm" : "",
        checked
          ? "border-secondary"
          : "hover:border-secondary border-secondary-50"
      )}
    >
      <Icon
        name={checked ? Icons.CheckboxChecked : Icons.CheckboxOutline}
        color={checked ? COLORS.accent : COLORS.secondary50}
      />
      <span
        className={clsx(
          "text-xl font-medium ",
          checked ? "text-secondary" : "text-secondary-50"
        )}
      >
        {text}
      </span>
    </div>
  );
};
