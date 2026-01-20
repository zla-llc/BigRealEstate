import { useAnimate } from "motion/react";
import { useCallback, useState } from "react";

export const useAnimationHelpers = () => {
  const [scope, animate] = useAnimate();
  const [animationRunning, setAnimationRunning] = useState(false);

  const ghostLayer = useCallback(
    async (
      targetLayer: string,
      zIndex: number = 0,
      duration = 0,
      delay = 0
    ) => {
      await animate(
        targetLayer,
        { position: "absolute", zIndex },
        { duration, delay }
      );
    },
    [animate]
  );

  const materializeLayer = useCallback(
    async (
      targetLayer: string,
      zIndex: number = 0,
      duration = 0,
      delay = 0
    ) => {
      await animate(
        targetLayer,
        {
          position: "relative",
          top: "unset",
          left: "unset",
          right: "unset",
          bottom: "unset",
          zIndex,
        },
        { duration, delay }
      );
    },
    [animate]
  );

  const hideLayer = useCallback(
    async (targetLayer: string, lvl: number = 0, duration = 0, delay = 0) => {
      await animate(targetLayer, { opacity: lvl }, { duration, delay });
    },
    [animate]
  );

  const showLayer = useCallback(
    async (targetLayer: string, duration = 0, delay = 0) => {
      await animate(targetLayer, { opacity: 1 }, { duration, delay });
    },
    [animate]
  );

  const sizeLayer = useCallback(
    async (
      targetLayer: string,
      width: number | string,
      height: number | string,
      duration = 0,
      delay = 0
    ) => {
      await animate(targetLayer, { width, height }, { delay, duration });
    },
    [animate]
  );

  const positionLayer = useCallback(
    async (
      targetLayer: string,
      top: number | string,
      left: number | string,
      duration = 0,
      delay = 0
    ) => {
      await animate(targetLayer, { top, left }, { delay, duration });
    },
    [animate]
  );

  const colorLayerBg = useCallback(
    async (
      targetLayer: string,
      backgroundColor: string,
      duration = 0,
      delay = 0
    ) => {
      await animate(
        targetLayer,
        { backgroundColor: backgroundColor },
        { delay, duration }
      );
    },
    [animate]
  );

  const alterLayerRadius = useCallback(
    async (
      targetLayer: string,
      radius: string | number,
      duration = 0,
      delay = 0
    ) => {
      await animate(targetLayer, { borderRadius: radius }, { duration, delay });
    },
    [animate]
  );

  const zIndex = useCallback(
    async (targetLayer: string, zIndex: number, duration = 0, delay = 0) => {
      await animate(targetLayer, { zIndex }, { duration, delay });
    },
    [animate]
  );

  return {
    scope,
    animate,

    animationRunning,
    setAnimationRunning,

    ghostLayer,
    materializeLayer,
    hideLayer,
    showLayer,
    sizeLayer,
    positionLayer,
    colorLayerBg,
    alterLayerRadius,
    zIndex,
  };
};
