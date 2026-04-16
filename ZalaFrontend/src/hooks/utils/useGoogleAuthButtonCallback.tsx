import { useSnack } from "./useSnack";
import { useAuthUser } from "./useAuthUser";
import type { IUser } from "../../interfaces";
import type { UseGoogleAuthButtonCallbackProps } from "../components";

export const useGoogleAuthButtonCallback = ({
  onMsg,
  onSuccess = () => {},
}: {
  onMsg: (user: IUser) => string;
  onSuccess?: () => void;
}) => {
  const loginUser = useAuthUser();
  const [successMsg, errorMsg] = useSnack();
  const callback = ({ error, user }: UseGoogleAuthButtonCallbackProps) => {
    if (user?.userId) {
      successMsg(onMsg(user));
      loginUser(user);
      return onSuccess();
    }

    errorMsg(error || "Google authentication failed - please try again");
  };
  return callback;
};
