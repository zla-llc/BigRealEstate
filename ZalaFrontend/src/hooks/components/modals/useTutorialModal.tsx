import { useApi, useUserTutorial } from "../../api";
import { useAuthStore, useTutorialStore } from "../../../stores";
import { useEffect, useState } from "react";
import { useOnTutorialModalChange, useTutorialPageTo } from "../../utils";
import type { ITutorial } from "../../../interfaces";
import { TutorialText, type TutorialTextKey } from "../../../config";

export const useTutorialModal = ({
  onClose = () => {},
}: {
  onClose?: () => void;
}) => {
  const { user } = useAuthStore();
  const tutorialStore = useTutorialStore();

  const api = useApi();
  const { pageToTutorialKey } = useTutorialPageTo();

  const [tutorial, setTutorial] = useUserTutorial({ userId: user?.userId });

  const [step, setStep] = useState(-1);
  const [tutorialText, setTutorialText] = useState("");

  const onTutorialModalChange = useOnTutorialModalChange();

  useEffect(() => {
    const key = pageToTutorialKey(tutorialStore.page);
    if (!key || !tutorial) return;
    setStep(tutorial[key]);
  }, [tutorial?.tutorial_id, tutorialStore.page]);

  useEffect(() => {
    if (step === -1) return;
    const text =
      TutorialText[tutorialStore.page.toLowerCase() as TutorialTextKey][step];

    setTutorialText(text);
  }, [tutorialStore.page, step]);

  const updateUserTutorial = async (addTo: number, setTo?: number) => {
    const key = pageToTutorialKey(tutorialStore.page);

    if (!tutorial || !key) return;

    const newTut: ITutorial = { ...tutorial };

    const newValue = setTo !== undefined ? setTo : tutorial[key] + addTo;
    newTut[key] = newValue;

    const res = await api.updateUserTutorial(newTut);

    if (res.err || !res.data) return;

    setTutorial(res.data);
    setStep(newValue);
    onTutorialModalChange(newValue);
  };

  const nextTutorial = async () => {
    await updateUserTutorial(1);
  };

  const backTutorial = async () => {
    await updateUserTutorial(-1);
  };

  const skipTutorial = async () => {
    await updateUserTutorial(-1, -1);
    onClose();
  };

  return {
    step,
    tutorialText,

    backTutorial,
    nextTutorial,
    skipTutorial,
  };
};
