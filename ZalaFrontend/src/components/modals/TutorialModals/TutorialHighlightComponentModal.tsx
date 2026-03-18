import clsx from "clsx";
import { useTutorialHighlightComponentModal } from "../../../hooks";
import { Button } from "../../buttons";
import { AnimatePresence, motion } from "motion/react";

type TutorialHighlightComponentModalProps = {
  onClose?: () => void;
};

export const TutorialHighlightComponentModal = ({
  onClose,
}: TutorialHighlightComponentModalProps) => {
  const {
    textRef,
    hiddenText,
    tutorialText,
    tutorialTextDims,
    Component,
    dims,
    nextTutorial,
  } = useTutorialHighlightComponentModal({
    onClose,
  });

  return (
    <div
      onClick={(e) => (e.preventDefault(), e.stopPropagation())}
      className="full relative"
    >
      <AnimatePresence>
        {!hiddenText && dims && Component && (
          <motion.div
            style={{
              top: dims.dims.screenY,
              left: dims.dims.screenX,

              minWidth: dims.dims.width,
              maxWidth: dims.dims.width,

              minHeight: dims.dims.height,
              height: dims.dims.height,
              maxHeight: dims.dims.height,
            }}
            className="absolute bg-transparent"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Component />
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={textRef}
        style={{ width: tutorialTextDims.width }}
        className="absolute opacity-0 pointer-events-none card-base-secondary p-3 flex flex-col space-y-3.5"
      >
        <p className="text-md">{tutorialText}</p>
        <div className="flex flex-row justify-end">
          <Button text="Ok" onClick={() => {}} />
        </div>
      </div>

      <AnimatePresence>
        {!hiddenText && (
          <motion.div
            style={{
              width: tutorialTextDims.width,
              top: tutorialTextDims.top,
              left: tutorialTextDims.left,
            }}
            className={clsx(
              "absolute card-base-secondary p-3 flex flex-col space-y-3.5",
              "transition-[opacity,scale] duration-150",
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-md">{tutorialText}</p>
            <div className="flex flex-row justify-end">
              <Button text="Ok" onClick={nextTutorial} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
