import { isValidString } from "../../validation";
import { useErrorSnack } from ".";

export const useIsAddressValid = () => {
  const onValidationFail = useErrorSnack();

  const isValid = (
    addressFormState: Map<string, string>,
    showSnack: boolean = false,
    addressName: string = "address"
  ) => {
    if (!isValidString(addressFormState.get("street1")))
      return onValidationFail(`Missing ${addressName} street`, showSnack);
    if (!isValidString(addressFormState.get("city")))
      return onValidationFail(`Missing ${addressName} city`, showSnack);
    if (!isValidString(addressFormState.get("zipcode")))
      return onValidationFail(`Missing ${addressName} zip`, showSnack);
    if (!isValidString(addressFormState.get("state")))
      return onValidationFail(`Missing ${addressName} state`, showSnack);
    if (!isValidString(addressFormState.get("country")))
      return onValidationFail(`Missing ${addressName} country`, showSnack);

    return true;
  };

  return isValid;
};
