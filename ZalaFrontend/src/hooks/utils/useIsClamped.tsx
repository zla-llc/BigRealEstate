import { useLayoutEffect, useRef, useState, type Ref } from "react";

export const useIsClamped = (): [Ref<HTMLParagraphElement>, boolean] => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [isClamped, setIsClamped] = useState(false);
  useLayoutEffect(() => {
    if (!ref.current) return;
    new ResizeObserver(() => {
      if (!ref.current) return;
      setIsClamped(ref.current.scrollHeight > ref.current.clientHeight);
    }).observe(ref.current);
  }, []);
  return [ref, isClamped];
};
