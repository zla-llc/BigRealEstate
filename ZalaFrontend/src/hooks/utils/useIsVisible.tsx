import React, { useEffect, useState } from "react";
import { throttle } from "lodash";
import { isOnScreen } from "../../utils";

export const useIsVisible = (
  currentElement: React.RefObject<HTMLElement | null>,
  offset = 0,
  throttleMilliseconds = 100,
) => {
  const [isVisible, setIsVisible] = useState(false);

  const onScroll = throttle(() => {
    if (!currentElement.current) {
      setIsVisible(false);
      return;
    }

    setIsVisible(isOnScreen(currentElement.current as HTMLDivElement, offset));
  }, throttleMilliseconds);

  useEffect(() => {
    document.addEventListener("scroll", onScroll, true);
    return () => document.removeEventListener("scroll", onScroll, true);
  }, []);

  return isVisible;
};
