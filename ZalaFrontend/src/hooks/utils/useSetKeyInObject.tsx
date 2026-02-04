import { produce } from "immer";
import React, { useCallback } from "react";

export type SetKeyInObjectSetterType = React.Dispatch<
  React.SetStateAction<Map<string, string>>
>;

export type SetKeyInObjectType = (
  key: string,
  setter: SetKeyInObjectSetterType
) => (value: string) => void;

export const useSetKeyInObject = (): SetKeyInObjectType => {
  const setKeyInObject = useCallback(
    (
        key: string,
        setter: React.Dispatch<React.SetStateAction<Map<string, string>>>
      ) =>
      (value: string) => {
        setter((prev) =>
          produce(prev, (draft) => {
            if (draft.has(key)) draft.set(key, value);
          })
        );
      },
    []
  );
  return setKeyInObject;
};
