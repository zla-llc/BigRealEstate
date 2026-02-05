import {
  BoardStepModalHeader,
  EditablePageHeaderVariant,
  PageHeader,
} from "../../headers";
import type { BoardModalPageProps } from "../BoardModal/types";
import { Button, ModalCenterButtons } from "../../buttons";
import { Icons } from "../../icons";
import { ManualCreateModalContainer } from "../../layout";
import { AddressInput, ImageCaroselInput, TextInput } from "../../inputs";
import { PropertyKeys, UnitTypeEnum } from "../../../interfaces";
import clsx from "clsx";
import { UnitFormSection } from "../../sections";
import { useManualCreateProperty } from "../../../hooks";

export const ManualCreateProperty = ({
  onBackBtn,
  onCloseBtn,
  onConfirm: parentOnConfirm,
  onTrashDeletes = false,
}: BoardModalPageProps & {
  onConfirm: (newLeadIds?: number[]) => void;
  onTrashDeletes?: boolean;
}) => {
  const {
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
  } = useManualCreateProperty({ onConfirm: parentOnConfirm, onTrashDeletes });

  return (
    <div className="full p-6 flex flex-col space-y-[15px]">
      <BoardStepModalHeader
        title={editingBoardItem ? "Edit Property" : "Add Property"}
        subtitle={editingBoardItem && <span />}
        onCloseBtn={onCloseBtn}
        onBackBtn={onBackBtn}
        onTrashBtn={editingBoardItem ? onRemovePropertyFromStep : undefined}
      />

      <ManualCreateModalContainer>
        <div className="width flex">
          <ImageCaroselInput
            selectedIndex={selectedImageIndex}
            setSelectedIndex={setSelectedImageIndex}
            images={images}
            selectedImage={selectedImage}
            limit={MAX_FILE_LIMIT}
            onAddImage={onAddFiles}
            onEditImage={onEditFile}
            onRemoveImage={onRemoveImage}
          />
        </div>

        <div className="flex flex-col space-y-[15px] py-[15px]">
          <div
            className={clsx(
              "flex flex-row justify-between items-center space-x-[30px]",
            )}
          >
            {unitButtons.map((unitBtn) => (
              <Button key={unitBtn.text} {...unitBtn} />
            ))}
          </div>

          {selectedUnitType === UnitTypeEnum.Multi && (
            <div className="flex items-center justify-center">
              <TextInput
                value={unitLimit > 0 ? unitLimit.toString() : ""}
                setValue={onUnitLimitChange}
                label="Unit Count"
                type="number"
              />
            </div>
          )}
        </div>

        <TextInput
          label="Property Name"
          value={propertyFormState.get(PropertyKeys.Name)}
          setValue={setKeyInObject(PropertyKeys.Name, setPropertyFormState)}
          optional
        />

        <TextInput
          label="MLS #"
          value={propertyFormState.get(PropertyKeys.MlsNumber)}
          setValue={setKeyInObject(
            PropertyKeys.MlsNumber,
            setPropertyFormState,
          )}
          optional
        />

        <PageHeader
          variant={EditablePageHeaderVariant.Underline}
          value={`${unitLimit > 1 ? "Primary" : "Property"} Address`}
          centerText
        />

        <AddressInput
          addressFormState={addressFormState}
          setAddressFormState={setAddressFormState}
          setKeyInObject={setKeyInObject}
        />

        <TextInput
          label="Notes:"
          value={propertyFormState.get(PropertyKeys.Notes)}
          setValue={setKeyInObject(PropertyKeys.Notes, setPropertyFormState)}
          optional
        />

        {unitFormStates.map((unitFormState, i) => (
          <UnitFormSection
            key={i}
            headerText={`Unit ${i + 1}`}
            unitState={unitFormState}
            setValue={setKeyInUnitsForm(i)}
            onRemove={() => removeUnit(i)}
          />
        ))}
      </ManualCreateModalContainer>

      <ModalCenterButtons
        primary={{
          text: editingBoardItem
            ? `Update Property`
            : selectedBoardItemIds.length > 0
              ? "Confirm & create properties"
              : "Create property",
          icon: Icons.Add,
          onClick: onConfirm,
        }}
      />
    </div>
  );
};
