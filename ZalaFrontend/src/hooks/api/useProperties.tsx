import React, { useEffect, useRef, useState } from "react";
import { type IProperty, APropertyToIProperty } from "../../interfaces";
import { useApi } from "./useApi";
import { stringify } from "../../utils";

export const useProperties = ({
  propertyIds,
  deps = [],
}: {
  propertyIds: number[];
  deps: unknown[];
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
    if (propertyIds.length !== 0) getProperties();
  }, [stringify(propertyIds), ...deps]);

  const getProperties = async () => {
    // TODO: Bug in this api route
    const res = await api.getProperties();

    if (res.data) {
      const props = res.data
        .map(APropertyToIProperty)
        .filter((property) => propertyIds.includes(property.propertyId));
      setProperties(props);
      propertiesRef.current = props;
    }
  };

  return [properties, setProperties, getProperties, propertiesRef];
};
