import { EditablePageHeaderVariant, PageHeader } from "../headers";
import { SwitchInput, TextInput } from "../inputs";
import { Button, ButtonVariant } from "../buttons";
import { Icons } from "../icons";
import { UnitKeys } from "../../interfaces";

type UnitFormSectionProps = {
  headerText?: string;
  unitState: Map<string, string>;
  setValue: (key: string, value: string) => void;
  onRemove?: () => void;
};

export const UnitFormSection = ({
  headerText,
  unitState,
  setValue,
  onRemove,
}: UnitFormSectionProps) => {
  const isSameAddress = unitState.get(UnitKeys.SameAddress) === "true";

  const rowSectionClassName =
    "flex flex-row items-center justify-center space-x-[30px]";
  const rowColumnClassName = "flex-1 flex flex-col space-y-[15px] h-full";

  return (
    <div className="flex flex-col space-y-[15px]">
      {headerText && (
        <PageHeader
          variant={EditablePageHeaderVariant.Underline}
          value={headerText}
          centerText
        />
      )}

      <div className="flex items-center justify-center">
        <div>
          <SwitchInput
            text="Same address as primary"
            checked={isSameAddress}
            onClick={() =>
              setValue(UnitKeys.SameAddress, isSameAddress ? "false" : "true")
            }
          />
        </div>
      </div>

      <div className={rowSectionClassName}>
        <div className={rowColumnClassName}>
          <TextInput
            label="Apartment #"
            value={unitState.get(UnitKeys.AptNum)}
            setValue={(v) => setValue(UnitKeys.AptNum, v)}
          />
          {/* <TextInput
            label="Floor Count"
            type="number"
            value={unitState.get(UnitKeys.Floors)}
            setValue={(v) => setValue(UnitKeys.Floors, v)}
          /> */}
          <TextInput
            label="Square Footage"
            type="number"
            optional
            value={unitState.get(UnitKeys.Sqft)}
            setValue={(v) => setValue(UnitKeys.Sqft, v)}
          />
        </div>
        <div className={rowColumnClassName}>
          <TextInput
            label="Bedroom Count"
            type="number"
            value={unitState.get(UnitKeys.Bedrooms)}
            setValue={(v) => setValue(UnitKeys.Bedrooms, v)}
          />
          <TextInput
            label="Bathroom Count"
            type="number"
            value={unitState.get(UnitKeys.Bath)}
            setValue={(v) => setValue(UnitKeys.Bath, v)}
          />
        </div>
      </div>

      <TextInput
        label="Notes:"
        value={unitState.get(UnitKeys.Notes)}
        setValue={(v) => setValue(UnitKeys.Notes, v)}
        optional
      />

      <div className={rowSectionClassName}>
        <div className={rowColumnClassName}></div>
        <div className={rowColumnClassName}>
          <Button
            text="Remove Unit"
            onClick={onRemove}
            bold
            borderLight
            variant={ButtonVariant.Destructive}
            icon={Icons.Trash}
          />
        </div>
      </div>
    </div>
  );
};
