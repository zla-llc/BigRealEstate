import { useBoolean } from "./useBoolean";

export const useBooleanToggle = (initial?: boolean): [boolean, () => void] => {
  const [isOpen, _, __, toggle] = useBoolean(initial);
  return [isOpen, toggle];
};
