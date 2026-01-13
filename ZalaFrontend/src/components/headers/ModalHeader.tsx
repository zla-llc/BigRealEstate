import clsx from "clsx";
import type { ReactNode } from "react";
import { useDimensions } from "../../hooks";
import { numStrToNum } from "../../utils";
import type { Actions } from "./types";
import { HeaderActions } from "./HeaderActions";

type ModalHeaderProps = {
  title: string;
  subtitle?: string | ReactNode;
  center?: boolean;
  underline?: boolean;
  actions?: (Actions | null)[];
};

export const ModalHeader = ({
  title,
  subtitle,
  center = true,
  underline = true,
  actions,
}: ModalHeaderProps) => {
  const centerStyle = center ? "flex items-center justify-center flex-col" : "";
  const [leftRef, leftDims] = useDimensions();
  const [rightRef, rightDims] = useDimensions();
  const iconWidth = Math.max(
    numStrToNum(leftDims.width),
    numStrToNum(rightDims.width),
    0
  );
  const iconClass = clsx("space-x-[15px]");
  return (
    <div className={clsx("space-y-[5px]", centerStyle)}>
      <div className={clsx("w-full flex flex-row", centerStyle)}>
        <div
          ref={leftRef}
          style={{ width: iconWidth }}
          className="space-x-[15px]"
        >
          <HeaderActions side="left" actions={actions} />
        </div>

        <div className={clsx("grow-1", centerStyle)}>
          <h2 className="text-2xl font-bold text-secondary">{title}</h2>
          {subtitle && (
            <p className="text-secondary-50 text-md line-clamp-2">{subtitle}</p>
          )}
        </div>

        <div ref={rightRef} style={{ width: iconWidth }} className={iconClass}>
          <HeaderActions side="right" actions={actions} />
        </div>
      </div>
      {underline && <div className="w-full mt-[5px] h-[2px] bg-secondary-50" />}
    </div>
  );
};
