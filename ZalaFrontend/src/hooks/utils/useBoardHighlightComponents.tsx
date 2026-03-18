import type { IHighlightComponentDims } from "./types";
import { useDimensions } from "./useDimensions";

export const useBoardHighlightComponents = () => {
  const [boardHeaderRef, boardHeaderDims, _setBoardHeaderDims, boardHeaderCount] =
    useDimensions();

  const [boardColumnsRef, boardColumnsDims, _setBoardColumnsDims, boardColumnsCount] =
    useDimensions();

  const highlightComponentDims: (IHighlightComponentDims | null)[] = [
    null, // Step 0: Board Overview (modal)
    { ref: boardHeaderRef, dims: boardHeaderDims }, // Step 1: Edit Board
    { ref: boardHeaderRef, dims: boardHeaderDims }, // Step 2: Board Settings
    { ref: boardColumnsRef, dims: boardColumnsDims }, // Step 3: Board Steps
  ];

  const highlightComponentDimsChange = [
    0,
    boardHeaderCount,
    boardHeaderCount,
    boardColumnsCount,
  ];

  return {
    refs: {
      boardHeaderRef,
      boardColumnsRef,
    },
    highlightComponentDims,
    highlightComponentDimsChange,
  };
};
