import {
  useEffect,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import { useHover, useTimeoutEffect } from "../../hooks";
import { AnimatePresence, motion } from "motion/react";

type TooltipContainerProps = {
  tooltipComponent?: ReactNode;
  titles?: { title: string; subTitle?: string };
};

export const TooltipContainer = ({
  tooltipComponent,
  titles,
  children,
}: PropsWithChildren<TooltipContainerProps>) => {
  const [isHovered, hoverProps] = useHover();

  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (isHovered) setShowTooltip(true);
  }, [isHovered]);

  useTimeoutEffect(
    () => {
      if (!isHovered) setShowTooltip(false);
    },
    [isHovered],
    300,
  );

  return (
    <div {...hoverProps} className="relative flex flex-col">
      <AnimatePresence>
        {showTooltip && (tooltipComponent || titles) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute top-0 left-0  z-10 -translate-y-[calc(100%+5px)]"
          >
            {tooltipComponent
              ? tooltipComponent
              : titles && (
                  <div className="inline-block w-max card-base-secondary p-[15px]">
                    <TooltipTitle title={titles.title} />
                    {titles.subTitle && (
                      <TooltipSubTitle subtitle={titles.subTitle} />
                    )}
                  </div>
                )}
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
};

const TooltipTitle = ({ title }: { title: string }) => {
  return <p className="text-sm font-bold text-secondary">{title}</p>;
};

const TooltipSubTitle = ({ subtitle }: { subtitle: string }) => {
  return <p className="text-xs text-secondary">{subtitle}</p>;
};

TooltipContainer.TooltipTitle = TooltipTitle;
TooltipContainer.TooltipSubTitle = TooltipSubTitle;
