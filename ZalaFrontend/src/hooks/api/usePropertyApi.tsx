import type {
  AAddress,
  AImage,
  AProperty,
  AUnit,
  IProperty,
} from "../../interfaces";
import type { APIHookProps, CreatePropertyImageProps } from "./types";
import { useAddressApi } from "./useAddressApi";
import { useFetch } from "./useFetch";
import { useUnitApi } from "./useUnitApi";

export const usePropertyApi = (props: APIHookProps) => {
  const { getSignal } = props;
  const { post, get, put, del } = useFetch();

  const addressApi = useAddressApi(props);
  const unitApi = useUnitApi(props);

  const { createAddress, editAddress, deleteAddress } = addressApi;
  const { createUnit, deleteUnit, updateUnit } = unitApi;

  const getUserProperties = async ({ userId }: { userId: number }) => {
    return await get<AProperty[]>(`/api/users/${userId}/properties`);
  };

  const createProperty = async ({
    property,
  }: {
    property: Omit<IProperty, "propertyId">;
  }) => {
    let createdAddress: AAddress | undefined = undefined;
    let createdProperty: AProperty | undefined = undefined;
    const createdUnits: AUnit[] = [];

    const errorOut = (msg: string | null, backup: string) => {
      throw new Error(msg ?? backup);
    };

    const createData = async (): Promise<AProperty> => {
      let apiProperty: AProperty | undefined = undefined;
      let apiAddress: AAddress | undefined = undefined;

      const addyRes = await createAddress({ address: property.address });

      if (addyRes.err || !addyRes.data)
        return errorOut(addyRes.err, "Creating property address api failed");

      apiAddress = addyRes.data;
      createdAddress = apiAddress;

      const propertyRes = await post<AProperty>(
        `/api/addresses/${addyRes.data.address_id}/properties`,
        {
          property_name: property.propertyName,
          mls_number: property.mlsNumber,
          notes: property.notes,
          image_url: property.imageUrl,
        },
        { isFormData: false, signal: getSignal("createProperty") },
      );

      if (propertyRes.err || !propertyRes.data)
        return errorOut(propertyRes.err, "Creating property api failed");

      apiProperty = propertyRes.data;
      createdProperty = apiProperty;

      for await (const unit of property.units) {
        const unitResponse = await createUnit({
          propertyId: createdProperty.property_id,
          unit,
        });
        if (unitResponse.err || !unitResponse.data)
          return errorOut(unitResponse.err, "Creating unit api failed");
        createdUnits.push(unitResponse.data);
      }

      return apiProperty;
    };

    const deleteData = async () => {
      if (createdAddress) {
        await deleteAddress({ addressId: createdAddress.address_id });

        if (createdProperty) {
          await deleteProperty({
            propertyId: createdProperty.property_id,
            addressId: createdAddress.address_id,
          });

          for await (const unit of createdUnits) {
            await deleteUnit({
              propertyId: createdProperty.property_id,
              unitId: unit.unit_id,
            });
          }
        }
      }
    };

    try {
      const property = await createData();
      return { data: { property }, err: null };
    } catch (e) {
      try {
        await deleteData();
      } catch (err) {
        console.log(`Property failed to create - Property failed to delete`);
      }

      if (e instanceof Error) return { err: e.message, data: null };
      if (typeof e === "string") return { err: e, data: null };
      return { err: "Internal error creating property", data: null };
    }
  };

  const updateProperty = async ({
    newProperty,
    ogProperty,
  }: {
    newProperty: Partial<IProperty>;
    ogProperty: IProperty;
  }) => {
    let touchedAddress: AAddress | undefined = undefined;
    let touchedProperty: AProperty | undefined = undefined;
    const touchedUnits: AUnit[] = [];
    const createdUnits: AUnit[] = [];

    const newPropertyUnitIds = (newProperty.units ?? []).map(
      (unit) => unit.unitId,
    );
    const removedUnits = ogProperty.units
      .map((unit) => unit.unitId)
      .filter((unitId) => !newPropertyUnitIds.includes(unitId));

    const errorOut = (msg: string | null, backup: string) => {
      throw new Error(msg ?? backup);
    };

    const propertyEdit = async (property: Partial<IProperty>) =>
      await put<AProperty>(
        `/api/addresses/${ogProperty.address.addressId}/properties/${ogProperty.propertyId}`,
        {
          property_name: property.propertyName ?? ogProperty.propertyName,
          mls_number: property.mlsNumber ?? ogProperty.mlsNumber,
          notes: property.notes ?? ogProperty.notes,
          image_url: property.imageUrl ?? ogProperty.imageUrl,
        },
        { isFormData: false, signal: getSignal("updateProperty") },
      );

    const createData = async (): Promise<AProperty> => {
      let apiProperty: AProperty | undefined = undefined;
      let apiAddress: AAddress | undefined = undefined;

      if (newProperty.address) {
        const addyRes = await editAddress({
          newAddress: newProperty.address,
          ogAddress: ogProperty.address,
        });

        if (addyRes.err || !addyRes.data)
          return errorOut(addyRes.err, "Editing property address api failed");

        apiAddress = addyRes.data;
        touchedAddress = apiAddress;
      }

      const propertyRes = await propertyEdit(newProperty);

      if (propertyRes.err || !propertyRes.data)
        return errorOut(propertyRes.err, "Edit property api failed");

      apiProperty = propertyRes.data;
      touchedProperty = apiProperty;

      if (newProperty.units) {
        for await (const unit of newProperty.units) {
          const foundUnit = ogProperty.units.find(
            (ogUnit) => ogUnit.unitId === unit.unitId,
          );
          const unitResponse = await (!foundUnit
            ? createUnit({
                propertyId: touchedProperty.property_id,
                unit,
              })
            : updateUnit({
                propertyId: ogProperty.propertyId,
                newUnit: unit,
                ogUnit: foundUnit,
              }));
          if (unitResponse.err || !unitResponse.data)
            return errorOut(unitResponse.err, "Edit unit api failed");

          let pushTo = createdUnits;
          if (unit.unitId !== 1) pushTo = touchedUnits;
          pushTo.push(unitResponse.data);
        }
      }

      for await (const unitId of removedUnits) {
        await deleteUnit({ propertyId: ogProperty.propertyId, unitId });
      }

      return apiProperty;
    };

    const deleteData = async () => {
      if (touchedAddress) {
        await editAddress({
          ogAddress: ogProperty.address,
          newAddress: ogProperty.address,
        });

        if (touchedProperty) {
          await propertyEdit(ogProperty);

          for await (const unit of createdUnits) {
            await deleteUnit({
              propertyId: touchedProperty.property_id,
              unitId: unit.unit_id,
            });
          }

          for await (const unit of touchedUnits) {
            const foundUnit = ogProperty.units.find(
              (ogUnit) => ogUnit.unitId === unit.unit_id,
            );
            if (!foundUnit) continue;
            await updateUnit({
              propertyId: ogProperty.propertyId,
              newUnit: foundUnit,
              ogUnit: foundUnit,
            });
          }

          for await (const unitId of removedUnits) {
            await createUnit({
              propertyId: ogProperty.propertyId,
              unit: ogProperty.units.find((unit) => unit.unitId === unitId)!,
            });
          }
        }
      }
    };

    try {
      const property = await createData();
      return { data: { property }, err: null };
    } catch (e) {
      try {
        await deleteData();
      } catch (err) {
        console.log(`Property failed to create - Property failed to delete`);
      }

      if (e instanceof Error) return { err: e.message, data: null };
      if (typeof e === "string") return { err: e, data: null };
      return { err: "Internal error creating property", data: null };
    }
  };

  const getProperties = async () => {
    return await get<AProperty[]>(
      `/api/properties`,
      getSignal(`getProperties`),
    );
  };

  const addPropertyImage = async ({
    propertyId,
    addressId,
    caption,
    sortOrder,
    file,
    gallery = true,
  }: CreatePropertyImageProps) => {
    const formData = new FormData();
    formData.append("file", file);
    if (caption !== undefined) formData.append("caption", caption);
    if (sortOrder !== undefined) formData.append("sortOrder", sortOrder);
    return await post<AImage>(
      `/api/addresses/${addressId}/properties/${propertyId}/image${
        gallery ? "s" : ""
      }`,
      formData,
      { isFormData: true, signal: getSignal("addPropertyImage") },
    );
  };

  const updatePropertyImage = async ({
    newImage,
    ogImageId,
  }: {
    newImage: CreatePropertyImageProps;
    ogImageId: number;
  }) => {
    await deletePropertyImage({
      addressId: newImage.addressId,
      propertyId: newImage.propertyId,
      imageId: ogImageId,
    });
    return await addPropertyImage(newImage);
  };

  const deletePropertyImage = async ({
    imageId,
    propertyId,
    addressId,
  }: {
    imageId: number;
    propertyId: number;
    addressId: number;
  }) => {
    return await del(
      `/api/addresses/${addressId}/properties/${propertyId}/images/${imageId}`,
      getSignal("deleteLeadImage"),
    );
  };

  const deleteProperty = async ({
    propertyId,
    addressId,
  }: {
    propertyId: number;
    addressId: number;
  }) => {
    return await del(`/api/addresses/${addressId}/properties/${propertyId}`);
  };

  return {
    ...unitApi,
    getUserProperties,
    getProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    addPropertyImage,
    updatePropertyImage,
    deletePropertyImage,
  };
};
