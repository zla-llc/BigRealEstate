import {
  BoardStepModalHeader,
  CreateLeadsSelectedHeader,
  PageHeader,
} from "../../headers";
import type { BoardModalPageProps } from "./types";
import { ModalCenterButtons } from "../../buttons/ModalCenterButtons";
import { Icons } from "../../icons";
import {
  AddressInput,
  ImageCaroselInput,
  SwitchInput,
  TextInput,
} from "../../inputs";
import { useManualCreateLeadModalPage } from "../../../hooks";
import { ManualCreateModalContainer } from "../../layout";

export const ManualCreateLeadModalPage = ({
  onBackBtn,
  onConfirm: parentOnConfirm,
}: BoardModalPageProps & { onConfirm: (newLeadIds?: number[]) => void }) => {
  const {
    MAX_FILE_LIMIT,

    selectedBoardItemIds,

    editingBoardItem,

    selectedImageIndex,
    selectedImage,
    images,
    setSelectedImageIndex,
    onAddFiles,
    onEditFile,
    onRemoveImage,

    showBuisInputs,
    showContactInputs,
    showAddyInputs,
    toggleRequiredInputs,
    setShowAddyInputs,

    leadFormState,
    contactFormState,
    addressFormState,
    setKeyInObject,
    setLeadFormState,
    setContactFormState,
    setAddressFormState,

    onConfirm,
  } = useManualCreateLeadModalPage({ parentOnConfirm });

  const rowSectionClassName =
    "flex flex-row items-center justify-center space-x-[30px]";

  return (
    <div className="full p-6 flex flex-col space-y-[15px]">
      <BoardStepModalHeader
        title={editingBoardItem ? "Edit Lead" : undefined}
        subtitle={<span />}
        onCloseBtn={editingBoardItem && onBackBtn}
        onBackBtn={!editingBoardItem ? onBackBtn : undefined}
      />

      {!editingBoardItem && <CreateLeadsSelectedHeader />}

      <ManualCreateModalContainer>
        <div className={rowSectionClassName}>
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

          <div className="flex-1 h-full space-y-[15px]">
            <SwitchInput
              text="Add buisness"
              checked={showBuisInputs}
              onClick={toggleRequiredInputs("buisness")}
            />
            <SwitchInput
              text="Add contact"
              checked={showContactInputs}
              onClick={toggleRequiredInputs("contact")}
            />
            <SwitchInput
              text="Add address"
              checked={showAddyInputs}
              onClick={() => setShowAddyInputs((prev) => !prev)}
            />
          </div>
        </div>

        <div className="flex flex-col space-y-[15px]">
          <PageHeader value="Contact Info" centerText />

          {showBuisInputs && (
            <TextInput
              label="Buisness name:"
              value={leadFormState.get("buisness")}
              setValue={setKeyInObject("buisness", setLeadFormState)}
            />
          )}
          {showContactInputs && (
            <div className="space-y-[15px]">
              <TextInput
                label="First name:"
                value={contactFormState.get("firstName")}
                setValue={setKeyInObject("firstName", setContactFormState)}
              />
              <TextInput
                label="Last name:"
                value={contactFormState.get("lastName")}
                setValue={setKeyInObject("lastName", setContactFormState)}
              />
            </div>
          )}

          <TextInput
            label="Email:"
            value={contactFormState.get("email")}
            setValue={setKeyInObject("email", setContactFormState)}
            optional={showBuisInputs && !showContactInputs}
          />

          <TextInput
            label="Phone:"
            value={contactFormState.get("phone")}
            setValue={setKeyInObject("phone", setContactFormState)}
            optional
          />

          <TextInput
            label="Notes:"
            value={leadFormState.get("notes")}
            setValue={setKeyInObject("notes", setLeadFormState)}
            optional
          />

          <TextInput
            label="Website:"
            value={leadFormState.get("website")}
            setValue={setKeyInObject("website", setLeadFormState)}
            optional
          />
        </div>
        {showAddyInputs && (
          <div className="flex flex-col space-y-[15px]">
            <PageHeader value="Associated Address" centerText />

            <AddressInput
              addressFormState={addressFormState}
              setAddressFormState={setAddressFormState}
              setKeyInObject={setKeyInObject}
            />
          </div>
        )}
      </ManualCreateModalContainer>

      <ModalCenterButtons
        primary={{
          text: editingBoardItem
            ? `Update lead`
            : selectedBoardItemIds.length > 0
            ? "Confirm & create leads"
            : "Create lead",
          icon: editingBoardItem ? Icons.Edit : Icons.Add,
          onClick: onConfirm,
        }}
      />
    </div>
  );
};
