import { useEffect, useRef, useState } from "react";
import type { ITutorial } from "../../interfaces";
import { useApi } from "./useApi";
import { useTutorialStore } from "../../stores";

export const useUserTutorial = ({
  userId,
  deps = [],
  setToStore = false,
}: {
  userId?: number;
  deps?: unknown[];
  setToStore?: boolean;
}): [
  ITutorial | undefined,
  React.Dispatch<React.SetStateAction<ITutorial | undefined>>,
  (userId: number) => void,
  React.RefObject<ITutorial | undefined>,
  boolean,
] => {
  const api = useApi();
  const tutorialStore = useTutorialStore();

  const tutorialRef = useRef<ITutorial | undefined>(undefined);
  const [tutorial, setTutorial] = useState<ITutorial | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (userId) getUserTutorial(userId);
  }, [userId, ...deps]);

  const getUserTutorial = async (userId: number) => {
    setLoading(true);
    const res = await api.getUserTutorial(userId);
    setLoading(false);

    if (res.data) {
      const props = res.data;
      setTutorial(props);
      tutorialRef.current = props;

      if (setToStore) tutorialStore.setTutorial(props);
    }
  };

  return [tutorial, setTutorial, getUserTutorial, tutorialRef, loading];
};
