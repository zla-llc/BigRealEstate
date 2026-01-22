import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  useAnimationHelpers,
  useDimensions,
  type IDimensions,
} from "../../utils";

type UseAllBoardsPageAnimationProps = {
  onAnimationOut?: () => void;
};

export const useAllBoardsPageAnimation = ({
  onAnimationOut = () => {},
}: UseAllBoardsPageAnimationProps) => {
  const GROW_CONTAINER = "#grow-container";
  const TRAVEL_CONTAINER = "#travel-container";
  const GRID_CONTAINER = "#grid-container";
  const EXPANDED_BOARD = "#expanded-board";
  const ADD_STEP_BTN = "#add-step-container";
  const DURATION_SCALE = 0.75;

  const [_selectedRef, selectedDims, setSelectedDims] = useDimensions();
  const [animationDirection, setAnimationDirection] = useState<
    "forward" | "backward" | "none"
  >("none");

  const animationCallback = useRef<() => void>(() => {});
  const boardDivIdRef = useRef("unset");

  const {
    scope,
    zIndex,
    materializeLayer,
    colorLayerBg,
    alterLayerRadius,
    ghostLayer,
    sizeLayer,
    positionLayer,
    showLayer,
    hideLayer,
    setAnimationRunning,
  } = useAnimationHelpers();

  useEffect(() => {
    if (animationDirection === "none") return;

    (async () => {
      if (animationDirection === "forward") {
        await animateBoardIn();
      }

      if (animationDirection === "backward") {
        await animateBoardOut();
        boardDivIdRef.current = "unset";
        unselect();
      }

      animationCallback.current();
    })();

    return;
  }, [animationDirection]);

  const animateBoardIn = async () => {
    // Sequence Set 1 - SETUP - Update z indexs so travel is top layer, then size the layers and position travel container over correct grid item and show grid layer and travel layer

    await materializeLayer(GRID_CONTAINER, 0); // Scrollable container
    await ghostLayer(TRAVEL_CONTAINER, 1);
    await ghostLayer(GROW_CONTAINER, -1);
    await zIndex(ADD_STEP_BTN, -1);

    await sizeLayer(GROW_CONTAINER, selectedDims.width, selectedDims.height);
    await sizeLayer(TRAVEL_CONTAINER, selectedDims.width, selectedDims.height);
    await positionLayer(
      TRAVEL_CONTAINER,
      selectedDims.y,
      selectedDims.x,
      0,
      0.05
    );

    await showLayer(GRID_CONTAINER);
    await showLayer(TRAVEL_CONTAINER);
    await hideLayer(GROW_CONTAINER);
    await hideLayer(ADD_STEP_BTN);

    // Sequence Set 2 - Hide the selected item in grid container, then start hide animation of grid layer and start travel animation of travel container, afterwards setup the grow container to be in travel containers position and size
    await hideLayer(boardDivIdRef.current, 0);
    hideLayer(GRID_CONTAINER, 0, 0.5 * DURATION_SCALE);
    await positionLayer(TRAVEL_CONTAINER, 0, 0, 0.75 * DURATION_SCALE);

    await positionLayer(GROW_CONTAINER, 0, 0);
    await showLayer(GROW_CONTAINER);

    // Sequence Set 3 -  Update z indexs, grow container taking priority

    await ghostLayer(GRID_CONTAINER, 0);
    await ghostLayer(TRAVEL_CONTAINER, 0);
    await materializeLayer(GROW_CONTAINER, 1);
    await zIndex(ADD_STEP_BTN, 2);

    // Sequence Set 4 - Start layout animations, color, radius and size at same time
    showLayer(ADD_STEP_BTN, 0.5 * DURATION_SCALE, 0.5 * DURATION_SCALE);
    colorLayerBg(
      EXPANDED_BOARD,
      "var(--color-background)",
      0.5 * DURATION_SCALE,
      0.5 * DURATION_SCALE
    );
    alterLayerRadius(
      EXPANDED_BOARD,
      0,
      0.5 * DURATION_SCALE,
      0.5 * DURATION_SCALE
    );
    await sizeLayer(GROW_CONTAINER, "100%", "100%", 1 * DURATION_SCALE);

    setAnimationRunning(false);
    setAnimationDirection("none");
  };

  const animateBoardOut = async () => {
    // Sequence Set 1 - Update layer z indexs and layers so that expanded is shown, grid is hidden and travel is hidden
    await materializeLayer(GROW_CONTAINER, 1); // relative layer
    await ghostLayer(GRID_CONTAINER, -1);
    await ghostLayer(TRAVEL_CONTAINER, 0);
    await zIndex(ADD_STEP_BTN, 2);

    await showLayer(GROW_CONTAINER);
    await showLayer(ADD_STEP_BTN);
    await hideLayer(GRID_CONTAINER);
    await hideLayer(TRAVEL_CONTAINER);

    // Sequence Set 2 - Size the expanded layer down and move the travel layer into position while hidden
    hideLayer(ADD_STEP_BTN, 0, 0.5 * DURATION_SCALE, 0.25 * DURATION_SCALE);
    colorLayerBg(
      EXPANDED_BOARD,
      "var(--color-primary)",
      0.5 * DURATION_SCALE,
      0.25 * DURATION_SCALE
    );
    await sizeLayer(
      GROW_CONTAINER,
      selectedDims.width,
      selectedDims.height,
      1 * DURATION_SCALE
    );
    await positionLayer(TRAVEL_CONTAINER, 0, 0);

    // Sequence Set 3 - Update layers so travel is on top and hide grow container
    await materializeLayer(GROW_CONTAINER, 0);
    await zIndex(ADD_STEP_BTN, -1);
    await ghostLayer(TRAVEL_CONTAINER, 1);
    await showLayer(TRAVEL_CONTAINER);

    await hideLayer(GROW_CONTAINER);

    // Sequence Set 4 - Update layer z indexs and move travel container and then show grid layer
    await materializeLayer(GRID_CONTAINER, 0); // Scrollable container
    await ghostLayer(TRAVEL_CONTAINER, 1);
    await ghostLayer(GROW_CONTAINER, -1);

    positionLayer(
      TRAVEL_CONTAINER,
      selectedDims.y,
      selectedDims.x,
      0.75 * DURATION_SCALE
    );
    await showLayer(
      GRID_CONTAINER,
      0.5 * DURATION_SCALE,
      0.25 * DURATION_SCALE
    );

    await showLayer(boardDivIdRef.current, 0);

    await positionLayer(TRAVEL_CONTAINER, 0, 0);
    await hideLayer(TRAVEL_CONTAINER);

    setAnimationRunning(false);
    setAnimationDirection("none");
  };

  const unselect = useCallback(() => {
    setSelectedDims({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
    onAnimationOut();
  }, [setSelectedDims, onAnimationOut]);

  const getClickDivDimensions = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>): IDimensions => {
      const element = event.currentTarget;
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      const parent = element.offsetParent;
      let left = element.offsetLeft;
      let top = element.offsetTop;

      if (parent) {
        const htmlParent = parent as HTMLDivElement;
        top += htmlParent.offsetTop;
        top -= htmlParent.scrollTop;

        left += htmlParent.offsetLeft;
        left -= htmlParent.scrollLeft;
      }

      return {
        x: left,
        y: top,
        width,
        height,
      };
    },
    []
  );

  const runAnimation = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.stopPropagation();

      const startDims = getClickDivDimensions(event);

      boardDivIdRef.current = `#${event.currentTarget.id}`;

      setSelectedDims(startDims);
      setAnimationDirection("forward");
    },
    [setAnimationDirection, setSelectedDims, getClickDivDimensions]
  );

  const rewindAnimation = useCallback(
    (event?: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event?.stopPropagation();
      setAnimationDirection("backward");
    },
    [selectedDims.height, animateBoardOut, unselect]
  );

  const setAnimationCallback = useCallback((v: () => void) => {
    animationCallback.current = v;
  }, []);

  return {
    animationRunning: animationDirection !== "none",
    scope,
    runAnimation,
    rewindAnimation,
    setAnimationCallback,
  };
};
