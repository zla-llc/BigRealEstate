import { useEffect } from "react";
import { useAllowScrollStore, useGlobalModalStore } from "../../stores";

export const useAllowScrollController = () => {
  const { isScrollable, setIsScrollable } = useAllowScrollStore();
  const { isOpen } = useGlobalModalStore();
  useEffect(() => {
    document.body.style.overflowY = isScrollable ? "scroll" : "hidden";
  }, [isScrollable]);
  useEffect(() => {
    setIsScrollable(!isOpen);
  }, [isOpen]);
};
