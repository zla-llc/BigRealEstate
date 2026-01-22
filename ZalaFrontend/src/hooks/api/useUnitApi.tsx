import type { APIHookProps } from "./types";
import { useFetch } from "./useFetch";
import type { AUnit, IUnit } from "../../interfaces";

export const useUnitApi = (props: APIHookProps) => {
  const { getSignal } = props;
  const { post, get, put, del } = useFetch();

  const createUnit = async ({
    propertyId,
    unit,
  }: {
    propertyId: number;
    unit: IUnit;
  }) => {
    return post<AUnit>(
      `/api/properties/${propertyId}/units`,
      {
        apt_num: unit.aptNum,
        bedrooms: unit.bedrooms,
        bath: unit.bath,
        sqft: unit.sqft,
        notes: unit.notes,
      },
      { isFormData: false, signal: getSignal("createUnit") }
    );
  };

  const updateUnit = async ({
    propertyId,
    newUnit,
    ogUnit,
  }: {
    propertyId: number;
    newUnit: Partial<IUnit>;
    ogUnit: IUnit;
  }) => {
    return await put<AUnit>(
      `/api/properties/${propertyId}/units/${ogUnit.unitId}`,
      {
        property_id: propertyId,
        apt_num: newUnit.aptNum ?? ogUnit.aptNum,
        bedrooms: newUnit.bedrooms ?? ogUnit.bedrooms,
        bath: newUnit.bath ?? ogUnit.bath,
        sqft: newUnit.sqft ?? ogUnit.sqft,
        notes: newUnit.notes ?? ogUnit.notes,
      },
      { isFormData: false, signal: getSignal("updateUnit") }
    );
  };

  const getUnit = async ({
    unitId,
    propertyId,
  }: {
    unitId: number;
    propertyId: number;
  }) => {
    return await get<AUnit>(
      `/api/properties/${propertyId}/units/${unitId}`,
      getSignal("getUnit")
    );
  };

  const getUnits = async ({ propertyId }: { propertyId: number }) => {
    return await get<AUnit[]>(
      `/api/properties/${propertyId}/units`,
      getSignal("getUnits")
    );
  };

  const deleteUnit = async ({
    propertyId,
    unitId,
  }: {
    propertyId: number;
    unitId: number;
  }) => {
    return await del(
      `/api/properties/${propertyId}/units/${unitId}`,
      getSignal("deleteUnit")
    );
  };

  return {
    getUnit,
    getUnits,
    createUnit,
    updateUnit,
    deleteUnit,
  };
};
