import { useSnack } from "./useSnack";

export const useErrorSnack = () => {
  const [_, errorSnack] = useSnack();
  const onError = (value: string = "", showSnack = true, returnVal = false) => {
    if (showSnack && value.length !== 0) errorSnack(value);
    return returnVal;
  };
  return onError;
};
