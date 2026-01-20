import clsx from "clsx";
import { Button } from "./Button";
import { ButtonVariant } from "./ButtonVariant";
import type { ModalButtonsProps } from "./ModalButtons";

export const ModalCenterButtons = ({
  secondary,
  primary,
}: ModalButtonsProps) => {
  const containerClass = "w-full flex items-center justify-center";
  const containerChildClass = "w-[50%]";
  return (
    <div className="flex flex-col space-y-[15px] pt-[15px]">
      <div className={clsx(containerClass)}>
        <div className={containerChildClass}>
          <Button
            text={primary.text}
            onClick={primary.onClick}
            disabled={primary.disabled}
            icon={primary.icon}
          />
        </div>
      </div>
      {secondary && (
        <div className={clsx(containerClass)}>
          <div className={containerChildClass}>
            <Button
              text={secondary?.text ?? ""}
              onClick={secondary?.onClick}
              variant={secondary?.variant ?? ButtonVariant.Secondary}
              icon={secondary?.icon}
              disabled={secondary?.disabled}
            />
          </div>
        </div>
      )}
    </div>
  );
};
