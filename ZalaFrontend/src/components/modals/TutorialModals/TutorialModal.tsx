import { IMAGES } from "../../../assets";
import { useTutorialModal } from "../../../hooks";
import { ModalButtons } from "../../buttons";
import { ModalHeader } from "../../headers";

type TutorialModalProps = {
  onClose?: () => void;
};

export const TutorialModal = ({ onClose }: TutorialModalProps) => {
  const { tutorialText, nextTutorial, skipTutorial } = useTutorialModal({
    onClose,
  });
  return (
    <div className="full p-6 flex flex-col space-y-[30px]">
      <ModalHeader title={"Dashboard Tutorial"} actions={[]} />
      <div className="h-full flex flex-col items-center justify-center space-y-[30px] overflow-y-scroll">
        <div className="w-[200px]">
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
