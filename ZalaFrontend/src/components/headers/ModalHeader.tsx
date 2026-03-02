import clsx from "clsx";
import type { ReactNode } from "react";
import { useDimensions } from "../../hooks";
import { numStrToNum } from "../../utils";
import type { Actions } from "./types";
import { HeaderActions } from "./HeaderActions";
import { Icon, Icons } from "../icons";

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
  const centerColStyle = center
    ? "flex items-center justify-center flex-col"
    : "";
  const centerRowStyle = center
    ? "flex items-center justify-center flex-row"
    : "";
  const [leftRef, leftDims] = useDimensions();
  const [rightRef, rightDims] = useDimensions();
  const iconWidth = Math.max(
    numStrToNum(leftDims.width),
    numStrToNum(rightDims.width),
    0,
  );
  const iconClass = clsx("space-x-[15px]");
  return (
    <div className={clsx("space-y-[5px]", centerColStyle)}>
      <div className={clsx("w-full flex relative", centerRowStyle)}>
        <div
          className={clsx("flex flex-row grow-1 opacity-0 pointer-events-none")}
        >
          <Icon name={Icons.Search} />
          <div>
            <h2 className="text-2xl">Base</h2>
            <p className="text-md">Base</p>
          </div>
        </div>

        <div className={clsx("absolute-fill z-[1]", centerColStyle)}>
          <div className={clsx("grow-1", centerColStyle)}>
            <h2 className="text-2xl font-bold text-secondary">{title}</h2>
            {subtitle && (
              <p className="text-secondary-50 text-md line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="absolute-fill z-[2] flex flex-row items-center justify-between ">
          <div
            ref={leftRef}
            style={{
              minWidth: iconWidth,
            }}
            className={clsx(iconClass, centerRowStyle)}
          >
            <HeaderActions side="left" actions={actions} />
          </div>
          <div
            ref={rightRef}
            style={{
              minWidth: iconWidth,
            }}
            className={clsx(iconClass, centerRowStyle)}
          >
            <HeaderActions side="right" actions={actions} />
          </div>
        </div>
      </div>

      {underline && <div className="w-full  h-[2px] bg-secondary-50" />}
    </div>
  );
};
