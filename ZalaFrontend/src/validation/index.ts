import { DefinedValidation } from "./exists";
import { StringValidation } from "./strings";

export * from "./strings";

export const Validation = {
  String: StringValidation,
  Object: DefinedValidation,
};
