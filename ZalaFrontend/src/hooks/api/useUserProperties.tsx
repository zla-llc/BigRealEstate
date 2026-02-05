import { useEffect, useState } from "react";
import { useApi } from "./useApi";
import { APropertyToIProperty, type IProperty } from "../../interfaces";

export const useUserProperties = ({
  userId,
  deps = [],
}: {
  userId: number;
  deps?: unknown[];
}): [
  IProperty[],
  React.Dispatch<React.SetStateAction<IProperty[]>>,
  (userId: number) => Promise<void>,
] => {
  const api = useApi();

  const [properties, setProperties] = useState<IProperty[]>([]);

  useEffect(() => {
    if (userId !== -1) getUserProperties(userId);
  }, [userId, ...deps]);

  const getUserProperties = async (userId: number) => {
    const res = await api.getUserProperties({ userId });

    if (res.data) {
      setProperties(res.data.map(APropertyToIProperty));
    }
  };

  return [properties, setProperties, getUserProperties];
};
