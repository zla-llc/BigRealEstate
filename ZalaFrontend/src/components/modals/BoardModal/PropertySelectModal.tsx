import type { BoardModalPageProps } from "./types";
import { BoardStepModalHeader } from "../../headers";
import { useEffect } from "react";

export const PropertySelectModal = (
  props: BoardModalPageProps & { onConfirm: () => void }
) => {
  const { onBackBtn } = props;

  useEffect(() => {
    // (async () => {
    //   await
    // })()
    // TODO - Get properties created by signed in user, allow them to be selected/viewed and then call onConfirm
  }, []);

  return (
    <div className="full p-6 flex flex-col space-y-[15px]">
      <BoardStepModalHeader onBackBtn={onBackBtn} />

      <div className="grow flex-1 flex flex-col"></div>
    </div>
  );
};
