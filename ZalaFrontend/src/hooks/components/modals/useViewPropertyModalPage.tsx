import { useCallback } from "react";
import {
  useSelectedIdStore,
  useViewPropertyModalControlStore,
} from "../../../stores";
import { useProperty } from "../../api";
import { resolveAssetUrl } from "../../../utils";

export const useViewPropertyModalPage = () => {
  const selectedIdStore = useSelectedIdStore();
  const { title, primaryBtn, secondaryBtn, isClosed, onEdit } =
    useViewPropertyModalControlStore();
  const [property, _set, _get, _ref, loadingProperty] = useProperty({
    propertyId: selectedIdStore.propertyId,
  });

  const images = property?.images ?? [];
  const toUrl = useCallback((url?: string) => resolveAssetUrl(url), []);

  return {
    title,
    isClosed,
    images,

    property,
    loadingProperty,

    primaryBtn,
    secondaryBtn,

    onEdit,
    toUrl,
  };
};
