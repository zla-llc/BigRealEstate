import { produce } from "immer";
import { useCallback, useState } from "react";
import { ButtonVariant, type ButtonProps } from "../../components";
import {
  type IProperty,
  UnitTypeEnum,
  PropertyKeys,
  AddressKeys,
  UnitKeys,
  type IUnit,
  APropertyToIProperty,
} from "../../interfaces";
import {
  useAuthStore,
  useAddBoardStepLeadStore,
  useCreatePropertyStore,
} from "../../stores";
import { isValidString, Validation } from "../../validation";
import { usePropertyUnits, useApi } from "../api";
import { useImageCaroselState, useDefaultAddressFormState } from "../state";
import { useSetKeyInObject, useErrorSnack, useTimeoutEffect } from "../utils";

const MAX_UNIT_COUNT = 25; // TODO - Ask about this limit maybe test performance of increasing this limit
const BASE_TEXT = "";
const BASE_NUM_TEXT = "1";

const DEFAULT_PROPERTY_MAP = new Map([
  [PropertyKeys.Name, BASE_TEXT],
  [PropertyKeys.MlsNumber, BASE_TEXT],
  [PropertyKeys.Notes, BASE_TEXT],
]);

const DEFAULT_UNIT_MAP = new Map([
  [UnitKeys.SameAddress, "true"],
  [UnitKeys.UnitId, "-1"],
  [UnitKeys.AptNum, BASE_NUM_TEXT],
  [UnitKeys.Bedrooms, BASE_NUM_TEXT],
  [UnitKeys.Bath, BASE_NUM_TEXT],
  [UnitKeys.Floors, BASE_NUM_TEXT],
  [UnitKeys.Sqft, BASE_TEXT],
  [UnitKeys.Notes, BASE_TEXT],
]);

export const useManualCreateProperty = ({
  onConfirm: parentOnConfirm,
  onTrashDeletes = false,
}: {
  onConfirm: (newLeadIds?: number[]) => void;
  onTrashDeletes?: boolean;
}) => {
  const user = useAuthStore((state) => state.user);
  const { selectedBoardItemIds, editBoardItemId } = useAddBoardStepLeadStore();

  // const step = useBoardStore((state) => state.step);
  // const { boardItems, itemType } = useStepItems({ step });
  // const editingBoardItem = boardItems.find((bItem) => {
  //   const id = getBoardItemId(bItem, itemType);
  //   return id !== -1 && id === editBoardItemId;
  // }) as IProperty | undefined;
  const { editingProperty: editingBoardItem } = useCreatePropertyStore();
  const [units, _setUnits] = usePropertyUnits({
    propertyId: editingBoardItem?.propertyId,
  });

  const {
    createProperty,
    updateProperty,
    addPropertyImage,
    updatePropertyImage,
    deletePropertyImage,
    linkUserToProperty,
    deleteProperty,
    unlinkUserFromProperty,
    apiResponseError,
  } = useApi();

  const setKeyInObject = useSetKeyInObject();
  const onValidationFail = useErrorSnack();

  const {
    MAX_FILE_LIMIT,

    selectedImageIndex,
    setSelectedImageIndex,
    selectedImage,
    images,
    deletingImageIds,

    setImages,
    onAddFiles,
    onEditFile,
    onRemoveImage,
  } = useImageCaroselState();

  const [selectedUnitType, setSelectedUnitType] = useState<UnitTypeEnum>(
    UnitTypeEnum.Single,
  );
  const [unitLimit, setUnitLimit] = useState<number>(1);

  const [propertyFormState, setPropertyFormState] = useState<
    Map<string, string>
  >(new Map(DEFAULT_PROPERTY_MAP.entries()));
  const [
    addressFormState,
    setAddressFormState,
    DEFAULT_ADDRESS_MAP,
    isAddressValid,
  ] = useDefaultAddressFormState({ quickFill: false });
  const [unitFormStates, setUnitFormStates] = useState<Map<string, string>[]>(
    [],
  );

  useTimeoutEffect(
    () => {
      initEdit();
    },
    [editBoardItemId, units.length],
    50,
  );

  useTimeoutEffect(
    () => {
      createUnits();
    },
    [unitLimit],
    750,
  );

  useTimeoutEffect(
    () => {
      correctUnitLimitAndType(unitLimit);
    },
    [unitLimit],
    1250,
  );

  const initEdit = () => {
    if (!editingBoardItem) return;

    const propertyState = new Map(DEFAULT_PROPERTY_MAP.entries());
    propertyState.set(PropertyKeys.Name, editingBoardItem.propertyName);
    propertyState.set(PropertyKeys.MlsNumber, editingBoardItem.mlsNumber);
    propertyState.set(PropertyKeys.Notes, editingBoardItem.notes);

    const addressState = new Map(DEFAULT_ADDRESS_MAP.entries());
    addressState.set(AddressKeys.Street1, editingBoardItem.address.street1);
    addressState.set(AddressKeys.Street2, editingBoardItem.address.street2);
    addressState.set(AddressKeys.City, editingBoardItem.address.city);
    addressState.set(AddressKeys.State, editingBoardItem.address.state);
    addressState.set(AddressKeys.Zip, editingBoardItem.address.zipcode);

    const unitsState = units.map((unit) => {
      const unitState = new Map(DEFAULT_UNIT_MAP.entries());
      unitState.set(UnitKeys.UnitId, unit.unitId.toString());
      unitState.set(UnitKeys.AptNum, unit.aptNum);
      unitState.set(UnitKeys.Bedrooms, unit.bedrooms.toString());
      unitState.set(UnitKeys.Bath, unit.bath.toString());
      unitState.set(UnitKeys.Sqft, unit.sqft.toString());
      unitState.set(UnitKeys.Notes, unit.notes);
      return unitState;
    });

    setPropertyFormState(propertyState);
    setAddressFormState(addressState);
    correctUnitLimitAndType(unitsState.length);
    setUnitFormStates(unitsState);
    setUnitLimit(unitsState.length);
    setImages(
      editingBoardItem.images.map((img, i) => ({
        image: img,
        order: img.sortOrder ?? i,
      })),
    );
    setSelectedImageIndex(editingBoardItem.images.length > 0 ? 0 : -1);
  };

  const calculateLimit = useCallback(
    (key: UnitTypeEnum) => {
      setUnitLimit(
        key === UnitTypeEnum.Single ? 1 : key === UnitTypeEnum.Double ? 2 : 3,
      );
      setSelectedUnitType(key);
    },
    [setUnitLimit, setSelectedUnitType],
  );

  const correctUnitLimitAndType = (limit: number) => {
    if (limit === 0)
      return (setSelectedUnitType(UnitTypeEnum.Single), setUnitLimit(1));
    if (limit === 1 && selectedUnitType !== UnitTypeEnum.Single)
      return setSelectedUnitType(UnitTypeEnum.Single);
    if (limit === 2 && selectedUnitType !== UnitTypeEnum.Double)
      return setSelectedUnitType(UnitTypeEnum.Double);
    if (limit >= 3 && selectedUnitType !== UnitTypeEnum.Multi)
      return setSelectedUnitType(UnitTypeEnum.Multi);
  };

  const onUnitLimitChange = (v: string) => {
    const value = Math.min(Math.round(parseInt(v) || 0), MAX_UNIT_COUNT);
    setUnitLimit(value);
  };

  const removeUnit = useCallback(
    (i: number) => {
      setUnitFormStates(
        produce((draft) => {
          draft.splice(i, 1);
          setUnitLimit(draft.length);
        }),
      );
    },
    [setUnitFormStates],
  );

  const setKeyInUnitsForm = useCallback(
    (i: number) => (key: string, value: string) => {
      setUnitFormStates(
        produce((draft) => {
          const unit = draft[i];
          unit.set(key, value);
          draft[i] = unit;
        }),
      );
    },
    [setUnitFormStates],
  );

  const createUnits = () => {
    if (unitLimit === 0) return;

    // Create state for each unit, if unit state prev existed do not alter original state

    const newUnitState = [];
    for (let i = 0; i < unitLimit; i++) {
      const lastUnit = i > 0 ? newUnitState[i - 1] : undefined;

      if (i <= unitFormStates.length - 1) {
        newUnitState.push(unitFormStates[i]);
        continue;
      }

      const defaultMap = new Map(DEFAULT_UNIT_MAP.entries());
      defaultMap.set(
        UnitKeys.AptNum,
        (parseInt(lastUnit?.get(UnitKeys.AptNum) ?? "") || i + 1).toString(),
      );

      newUnitState.push(defaultMap);
    }

    setUnitFormStates(newUnitState);
  };

  const unitButtons: ButtonProps[] = Object.values(UnitTypeEnum).map((key) => ({
    variant:
      selectedUnitType === key ? ButtonVariant.Primary : ButtonVariant.Tertiary,
    text: key + " Unit",
    onClick: () => calculateLimit(key),
  }));

  const isValidNumber = useCallback(
    (value: string | null | undefined, allowZero = false) =>
      value && !Number.isNaN(parseInt(value))
        ? allowZero
          ? Math.round(parseInt(value)) >= 0
          : Math.round(parseInt(value)) > 0
        : false,
    [],
  );

  const isValid = (showSnack = true) => {
    if (
      !isAddressValid(
        showSnack,
        `${unitLimit > 1 ? "Primary" : "Property"} Address`,
      )
    )
      return false;

    const validateNumberGreaterThan0 = (
      value: string | undefined,
      errorLoc: string,
    ) => {
      const isValidStr = isValidString(value);
      if (!isValidStr)
        return onValidationFail(
          `Missing value for unit ${errorLoc}`,
          showSnack,
        );
      const isValidNum = isValidNumber(value, false);
      if (!isValidNum)
        return onValidationFail(`Unit ${errorLoc} value must be more than 0`);
      return true;
    };

    for (let i = 0; i < unitFormStates.length; i++) {
      const unitForm = unitFormStates[i];

      if (!isValidString(unitForm.get(UnitKeys.AptNum)))
        return onValidationFail(`Missing unit ${i + 1}'s apt. #`);

      if (
        !validateNumberGreaterThan0(
          unitForm.get(UnitKeys.Bedrooms),
          `${i + 1}'s bedroom count`,
        )
      )
        return false;
      if (
        !validateNumberGreaterThan0(
          unitForm.get(UnitKeys.Floors),
          `${i + 1}'s floor count`,
        )
      )
        return false;
      if (
        !validateNumberGreaterThan0(
          unitForm.get(UnitKeys.Bath),
          `${i + 1}'s bath count`,
        )
      )
        return false;
    }

    return true;
  };

  const onConfirm = async () => {
    if (!isValid() || !user) return;

    const fullAddress = `${addressFormState.get("street1") ?? ""} ${
      addressFormState.get("city") ?? ""
    } ${addressFormState.get("state") ?? ""} ${
      addressFormState.get("zipcode") ?? ""
    }`;

    const thisOrThat = (val1: string | undefined, val2: string) =>
      val1 && val1.length > 0 ? val1 : val2;

    const sendingProperty: IProperty = {
      propertyId: editingBoardItem ? editBoardItemId : -1,
      propertyName: thisOrThat(
        propertyFormState.get(PropertyKeys.Name) ?? "",
        `${addressFormState.get("street1") ?? ""}`.trim(),
      ),
      mlsNumber: propertyFormState.get(PropertyKeys.MlsNumber) ?? "",
      notes: thisOrThat(
        propertyFormState.get(PropertyKeys.Notes) ?? "",
        fullAddress.trim(),
      ),
      address: {
        addressId: editingBoardItem?.address?.addressId ?? -1,
        street1: addressFormState.get("street1") ?? "",
        street2: addressFormState.get("street2") ?? "",
        city: addressFormState.get("city") ?? "",
        state: addressFormState.get("state") ?? "",
        zipcode: addressFormState.get("zipcode") ?? "",
        lat: 0,
        long: 0,
      },
      imageUrl: "",
      units: unitFormStates.map(
        (unit): IUnit => ({
          unitId: parseInt(unit.get(UnitKeys.UnitId) ?? "-1") || -1,
          aptNum: unit.get(UnitKeys.AptNum) ?? "",
          notes: unit.get(UnitKeys.Notes) ?? "",
          bedrooms: parseInt(unit.get(UnitKeys.Bedrooms) ?? "") || 1,
          bath: parseInt(unit.get(UnitKeys.Bath) ?? "") || 1,
          sqft: parseInt(unit.get(UnitKeys.Sqft) ?? "") || 1,
        }),
      ),
      images: [],
    };

    if (editingBoardItem) {
      editingBoardItem.units = units;
    }

    const response = await (editingBoardItem
      ? updateProperty({
          newProperty: sendingProperty,
          ogProperty: editingBoardItem,
        }) // BUG - When editing a unit the units come back in a distorted order, potentially requiring a sort order or a in place edits on the backend
      : createProperty({
          property: sendingProperty,
        }));

    if (response.err || !response.data)
      return apiResponseError("creating a property", response.err);

    const createdProperty = APropertyToIProperty(response.data.property);

    const newPropertyIds = [
      ...selectedBoardItemIds,
      createdProperty.propertyId,
    ];

    const filesOnly = images.filter((img) =>
      Validation.Object.isDefined(img.file),
    );
    const imgs = [];
    for await (const tempFile of filesOnly) {
      const newImage = {
        propertyId: createdProperty.propertyId,
        addressId: createdProperty.address.addressId,
        file: tempFile.file!,
        sortOrder: tempFile.order.toString(),
        gallery: true,
      };

      let imageAction = async () => await addPropertyImage(newImage);

      if (editingBoardItem && tempFile.image && tempFile.image.propertyImageId)
        imageAction = async () =>
          // TODO: Editing a lead, causes sort order to be disrupted and continuously increase, ie loses sort order number of removed image and does not replace sort order with new image added
          await updatePropertyImage({
            newImage,
            ogImageId: tempFile.image!.propertyImageId!,
          });

      const leadImage = await imageAction();
      imgs.push(leadImage);
    }

    for await (const imageId of deletingImageIds) {
      await deletePropertyImage({
        imageId,
        propertyId: createdProperty.propertyId,
        addressId: createdProperty.address.addressId,
      });
    }

    await linkUserToProperty({
      userId: user.userId,
      propertyId: createdProperty.propertyId,
    });

    parentOnConfirm(newPropertyIds);
  };

  const onRemovePropertyFromStep = async () => {
    if (onTrashDeletes && editingBoardItem && user) {
      await deleteProperty({
        propertyId: editingBoardItem.propertyId,
        addressId: editingBoardItem.address.addressId,
      });
      await unlinkUserFromProperty({
        propertyId: editingBoardItem.propertyId,
        userId: user.userId,
      });
    }

    parentOnConfirm(
      selectedBoardItemIds.filter(
        (boardItemId) => boardItemId !== editingBoardItem?.propertyId,
      ),
    );
  };

  return {
    editingBoardItem,
    selectedImageIndex,
    setSelectedImageIndex,
    images,
    selectedImage,
    MAX_FILE_LIMIT,
    onAddFiles,
    onEditFile,
    onRemoveImage,
    unitButtons,
    selectedUnitType,
    unitLimit,
    onUnitLimitChange,
    propertyFormState,
    setKeyInObject,
    setPropertyFormState,
    addressFormState,
    setAddressFormState,
    unitFormStates,
    setKeyInUnitsForm,
    removeUnit,
    selectedBoardItemIds,
    onConfirm,
    onRemovePropertyFromStep,
  };
};
