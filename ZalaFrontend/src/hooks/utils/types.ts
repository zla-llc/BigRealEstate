import type { IScreenDimensions } from "./useDimensions";

export type IHighlightComponentDims = {
  ref: React.RefObject<HTMLDivElement | null>;
  dims: IScreenDimensions;
};
