import { useTutorialModal } from "./useTutorialModal";
import { TextPlacement, useHighlightComponentStore } from "../../../stores";
import { useEffect, useState } from "react";
import { useDimensions, useTimeoutEffect } from "../../utils";
import { numStrToNum } from "../../../utils";

type TutorialTextDims = {
  width: number;
  top: number;
  left: number;
};

export const useTutorialHighlightComponentModal = ({
  onClose = () => {},
}: {
  onClose?: () => void;
}) => {
  const TUTORIAL_TEXT_WIDTH = Math.round(document.body.clientWidth / 3);
  const highlightComponentStore = useHighlightComponentStore();

  const { step, tutorialText, nextTutorial } = useTutorialModal({ onClose });

  const [textRef, textDims] = useDimensions();
  const [tutorialTextDims, setTutorialTextDims] = useState<TutorialTextDims>({
    width: TUTORIAL_TEXT_WIDTH,
    top: 0,
    left: 0,
  });

  const [hiddenText, setHiddenText] = useState(true);

  const currentStepDims =
    step !== -1
      ? highlightComponentStore.highlightComponentDims[step]
      : undefined;
  const currentStepPosition =
    step !== -1 ? highlightComponentStore.textPlacement[step] : undefined;
  const Component =
    step !== -1 ? highlightComponentStore.components[step] : null;

  useEffect(() => {
    calculateTextDims();
  }, []);

  useTimeoutEffect(
    () => {
      // console.log(``);
      // console.log(`Calculating Text Dims:`);
      calculateTextDims();
    },
    [
      highlightComponentStore.textPlacement,
      currentStepDims?.dims.screenY,
      currentStepDims?.dims.screenX,
      currentStepDims?.dims.width,
      currentStepDims?.dims.height,
    ],
    250,
  );

  const calculateTextDims = () => {
    const newDims: TutorialTextDims = {
      width: TUTORIAL_TEXT_WIDTH,
      top: 0,
      left: 0,
    };

    if (!currentStepDims) return;

    newDims.left = getLeftPosition();
    newDims.top = getTopPosition();

    // console.log(``);
    // console.log(`Current Component Dimensions:`);
    // console.log(currentStepDims);
    // console.log(`New Position`);
    // console.log(newDims);
    // console.log(`Current Text Dims`);
    // console.log(textDims);
    // console.log(``);
    setTutorialTextDims(newDims);
    setHiddenText(false);
  };

  const getTopPosition = () => {
    if (!currentStepDims) return 0;

    switch (currentStepPosition) {
      case TextPlacement.Top:
        return (
          numStrToNum(currentStepDims.dims.screenY) -
          numStrToNum(textDims.height) -
          10
        );
      case TextPlacement.Bottom:
        return (
          numStrToNum(currentStepDims.dims.screenY) +
          numStrToNum(currentStepDims.dims.height) +
          10
        );
      case TextPlacement.Right:
      case TextPlacement.Left:
        return (
          numStrToNum(currentStepDims.dims.screenY) +
          numStrToNum(currentStepDims.dims.height) / 2 -
          numStrToNum(textDims.height) / 2
        );

      default:
        return 0;
    }
  };

  const getLeftPosition = () => {
    if (!currentStepDims) return 0;

    switch (currentStepPosition) {
      case TextPlacement.Left:
        return (
          numStrToNum(currentStepDims.dims.screenX) -
          numStrToNum(textDims.width) -
          10
        );
      case TextPlacement.Right:
        return (
          numStrToNum(currentStepDims.dims.screenX) +
          numStrToNum(currentStepDims.dims.width) +
          10
        );
      case TextPlacement.Bottom:
      case TextPlacement.Top:
        return (
          numStrToNum(currentStepDims.dims.screenX) +
          numStrToNum(currentStepDims.dims.width) / 2 -
          numStrToNum(textDims.width) / 2
        );
      default:
        return 0;
    }
  };

  return {
    Component,
    textRef,
    hiddenText,
    tutorialText,
    tutorialTextDims,
    dims: currentStepDims,
    nextTutorial: () => (
      setHiddenText(true),
      setTimeout(() => nextTutorial(), 150)
    ),
  };
};
