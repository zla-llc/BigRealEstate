import { Button } from "./Button";
import type { Icons } from "../icons";
import { ButtonVariant } from "./ButtonVariant";
import clsx from "clsx";

export type ModalButtonProps = {
  text: string;
  icon?: Icons;
  disabled?: boolean;
  onClick?: () => void;
};

export type ModalButtonsProps = {
  primary: ModalButtonProps;
  secondary?: ModalButtonProps & { variant?: ButtonVariant };
};

export const ModalButtons = ({ primary, secondary }: ModalButtonsProps) => {
  return (
    <div className="flex flex-row space-x-[15px] pt-[15px]">
      <div
        className={clsx(
          "flex-1",
          secondary ? "" : "opacity-0 pointer-events-none",
        )}
      >
        <Button
          text={secondary?.text ?? ""}
          onClick={secondary?.onClick}
          variant={secondary?.variant ?? ButtonVariant.Secondary}
          icon={secondary?.icon}
          disabled={secondary?.disabled}
        />
      </div>

      <div className={clsx("flex-1")}>
        <Button
          text={primary.text}
          onClick={primary.onClick}
          disabled={primary.disabled}
          icon={primary.icon}
        />
      </div>
    </div>
  );
};
