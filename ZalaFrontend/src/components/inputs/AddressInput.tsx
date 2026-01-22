import clsx from "clsx";
import { TextInput } from "./TextInput";
import type { SetKeyInObjectType, SetKeyInObjectSetterType } from "../../hooks";

type AddressInputProps = {
  addressFormState: Map<string, string>;
  setAddressFormState: SetKeyInObjectSetterType;
  setKeyInObject: SetKeyInObjectType;
};

export const AddressInput = ({
  addressFormState,
  setKeyInObject,
  setAddressFormState,
}: AddressInputProps) => {
  const rowSectionClassName =
    "flex flex-row items-center justify-center space-x-[30px]";
  return (
    <div className="flex flex-col space-y-[15px]">
      <TextInput
        label="Street 1:"
        value={addressFormState.get("street1")}
        setValue={setKeyInObject("street1", setAddressFormState)}
      />
      <TextInput
        label="Street 2:"
        value={addressFormState.get("street2")}
        setValue={setKeyInObject("street2", setAddressFormState)}
      />

      <div className={clsx(rowSectionClassName, "")}>
        <div className="flex-1">
          <TextInput
            label="City:"
            value={addressFormState.get("city")}
            setValue={setKeyInObject("city", setAddressFormState)}
          />
        </div>
        <div className="flex-1">
          <TextInput
            label="State:"
            value={addressFormState.get("state")}
            setValue={setKeyInObject("state", setAddressFormState)}
          />
        </div>
      </div>
      <div className={rowSectionClassName}>
        <div className="flex-1">
          <TextInput
            label="Zip:"
            value={addressFormState.get("zipcode")}
            setValue={setKeyInObject("zipcode", setAddressFormState)}
          />
        </div>
        <div className="flex-1">
          <TextInput label="Country:" value={addressFormState.get("country")} />
        </div>
      </div>
    </div>
  );
};
