import React, { useEffect, useState } from "react";
import { useApi } from "./useApi";
import type { OnErrorOptions } from "../utils";
import { AUnitToIUnit, type IUnit } from "../../interfaces";

export const usePropertyUnits = ({
  propertyId,
  options = { showSnack: true },
}: {
  propertyId?: number;
  options?: OnErrorOptions;
}): [IUnit[], React.Dispatch<React.SetStateAction<IUnit[]>>] => {
  const { getUnits, apiResponseError } = useApi();
  const [units, setUnits] = useState<IUnit[]>([]);
  useEffect(() => {
    if (!propertyId) return;
    (async () => {
      const res = await getUnits({ propertyId });
      if (res.err || !res.data)
        return apiResponseError(`getting property units`, res.err, options);
      setUnits(res.data.map(AUnitToIUnit));
    })();
  }, [propertyId]);
  return [units, setUnits];
};
