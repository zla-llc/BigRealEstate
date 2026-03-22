import { IMAGES } from "../../../assets";
import { useTutorialModal } from "../../../hooks";
import { ModalButtons } from "../../buttons";
import { ModalHeader } from "../../headers";

type TutorialModalProps = {
  onClose?: () => void;
};

export const TutorialModal = ({ onClose }: TutorialModalProps) => {
  const { tutorialText, tutorialStore, nextTutorial, skipTutorial } =
    useTutorialModal({
      onClose,
      fireOnChange: true,
    });
  return (
    <div className="full p-6 flex flex-col space-y-7.5">
      <ModalHeader title={tutorialStore.page + " Tutorial"} actions={[]} />
      <div className="h-full flex flex-col items-center justify-center space-y-7.5 overflow-y-scroll">
        <div className="w-50">
          <img src={IMAGES.ZalaBotWave} alt={"Zala Bot"} />
        </div>

        <p className="text-lg text-secondary text-center">{tutorialText}</p>
        <p className="text-md text-secondary-50 text-center">
          Do you want to see a tutorial for this page?
        </p>
      </div>
      <ModalButtons
        primary={{ text: "Lets go!", onClick: nextTutorial }}
        secondary={{ text: "Nah", onClick: skipTutorial }}
      />
    </div>
  );
};
