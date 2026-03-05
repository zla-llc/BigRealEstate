import clsx from "clsx";
import { useTutorialHighlightComponentModal } from "../../../hooks";
import { Button } from "../../buttons";

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
      {dims && Component && (
        <div
          style={{
            top: dims.dims.screenY,
            left: dims.dims.screenX,

            minWidth: dims.dims.width,
            maxWidth: dims.dims.width,

            minHeight: dims.dims.height,
            maxHeight: dims.dims.height,
          }}
          className="absolute bg-transparent"
        >
          <Component />
        </div>
      )}

      <div
        ref={textRef}
        style={{ width: tutorialTextDims.width }}
        className="absolute opacity-100 pointer-events-none card-base-secondary p-3 flex flex-col space-y-3.5"
      >
        <p className="text-md">{tutorialText}</p>
        <div className="flex flex-row justify-end">
          <Button text="Ok" />
        </div>
      </div>

      <div
        style={{
          width: tutorialTextDims.width,
          top: tutorialTextDims.top,
          left: tutorialTextDims.left,
        }}
        className={clsx(
          "absolute card-base-secondary p-3 flex flex-col space-y-3.5",
          "transition-[opacity,scale] duration-150",
          !hiddenText ? "opacity-100 scale-100" : "opacity-0 scale-50",
        )}
      >
        <p className="text-md">{tutorialText}</p>
        <div className="flex flex-row justify-end">
          <Button text="Ok" onClick={nextTutorial} />
        </div>
      </div>
    </div>
  );
};
