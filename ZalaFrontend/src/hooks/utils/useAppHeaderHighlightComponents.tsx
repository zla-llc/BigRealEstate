import { useEffect } from "react";
import type { IHighlightComponentDims } from "./types";
import { useDimensions } from "./useDimensions";

export const useAppHeaderHighlightComponents = () => {
  const [searchBarRef, searchBarDims, __setSearchBarDims, searchBarCount] =
    useDimensions();

  const highlightComponentDims: (IHighlightComponentDims | null)[] = [
    { ref: searchBarRef, dims: searchBarDims },
  ];

  const highlightComponentDimsChange = [searchBarCount];

  // useEffect(() => {
  //   console.log(`Dims: `);
  //   console.log(searchBarRef);
  //   console.log(searchBarDims);
  //   console.log(``);
  // }, [searchBarCount]);

  return {
    refs: {
      searchBarRef,
    },
    highlightComponentDims,
    highlightComponentDimsChange,
  };
};
