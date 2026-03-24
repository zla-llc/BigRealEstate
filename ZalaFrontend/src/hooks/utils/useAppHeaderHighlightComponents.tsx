import type { IHighlightComponentDims } from "./types";
import { useDimensions } from "./useDimensions";

export const useAppHeaderHighlightComponents = () => {
  const [searchBarRef, searchBarDims, __setSearchBarDims, searchBarCount] =
    useDimensions();

  const highlightComponentDims: (IHighlightComponentDims | null)[] = [
    { ref: searchBarRef, dims: searchBarDims },
  ];

  const highlightComponentDimsChange = [searchBarCount];

  return {
    refs: {
      searchBarRef,
    },
    highlightComponentDims,
    highlightComponentDimsChange,
  };
};
