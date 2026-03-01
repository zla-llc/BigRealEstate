import React, { useEffect, useRef, useState } from "react";
import { APropertyToIProperty, type IProperty } from "../../interfaces";
import { useApi } from "./useApi";
import { useBooleanToggle } from "../utils";

export const useProperty = ({
  propertyId,
  deps = [],
}: {
  propertyId?: number;
  deps?: unknown[];
}): [
  IProperty | undefined,
  React.Dispatch<React.SetStateAction<IProperty | undefined>>,
  () => Promise<void>,
  React.RefObject<IProperty | undefined>,
  loading: boolean,
] => {
  const api = useApi();

  const propertyRef = useRef<IProperty | undefined>(undefined); // For bug encountered accessing state from openAddTeamPropertiesModal
  const [property, setProperty] = useState<IProperty | undefined>(undefined);
  const [loading, toggleLoad] = useBooleanToggle();

  useEffect(() => {
    if (propertyId) getProperties();
  }, [propertyId, ...deps]);

  const getProperties = async () => {
    // TODO: Bug in this api route
    toggleLoad();
    const res = await api.getProperties();
    toggleLoad();

    if (res.data) {
      const prop = res.data
        .map(APropertyToIProperty)
        .find((property) => property.propertyId === propertyId);
      setProperty(prop);
      propertyRef.current = prop;
    }
  };

  return [property, setProperty, getProperties, propertyRef, loading];
};
