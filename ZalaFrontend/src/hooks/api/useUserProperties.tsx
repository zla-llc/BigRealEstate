import { useEffect, useRef, useState } from "react";
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
  React.RefObject<IProperty[]>,
] => {
  const api = useApi();

  const propertiesRef = useRef<IProperty[]>([]); // For bug encountered accessing state from openAddTeamPropertiesModal
  const [properties, setProperties] = useState<IProperty[]>([]);

  useEffect(() => {
    if (userId !== -1) getUserProperties(userId);
  }, [userId, ...deps]);

  const getUserProperties = async (userId: number) => {
    const res = await api.getUserProperties({ userId });

    if (res.data) {
      setProperties(res.data.map(APropertyToIProperty));
      propertiesRef.current = res.data.map(APropertyToIProperty);
    }
  };

  return [properties, setProperties, getUserProperties, propertiesRef];
};
