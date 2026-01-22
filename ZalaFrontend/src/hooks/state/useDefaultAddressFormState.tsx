import React, { useState } from "react";
import { useIsAddressValid } from "../utils";

const BLANK_ADDRESS_MAP = new Map([
  ["street1", ""],
  ["street2", ""],
  ["city", ""],
  ["zipcode", ""],
  ["state", ""],
  ["country", "USA"],
]);

const FILLED_ADDRESS_MAP = new Map([
  ["street1", "65 Marine Dr"],
  ["street2", ""],
  ["city", "Amherst"],
  ["zipcode", "14228"],
  ["state", "NY"],
  ["country", "USA"],
]);

type UseDefaultAddressFormStateProps = {
  quickFill?: boolean;
};

export const useDefaultAddressFormState = (
  { quickFill }: UseDefaultAddressFormStateProps | undefined = {
    quickFill: false,
  }
): [
  Map<string, string>,
  React.Dispatch<React.SetStateAction<Map<string, string>>>,
  Map<string, string>,
  (showSnack?: boolean, addressName?: string) => boolean
] => {
  const startState = quickFill ? FILLED_ADDRESS_MAP : BLANK_ADDRESS_MAP;
  const [addressFormState, setAddressFormState] = useState(
    new Map(startState.entries())
  );

  const isAddressValid = useIsAddressValid();

  const isValid = (showSnack?: boolean, addressName?: string) =>
    isAddressValid(addressFormState, showSnack, addressName);

  return [addressFormState, setAddressFormState, startState, isValid];
};
