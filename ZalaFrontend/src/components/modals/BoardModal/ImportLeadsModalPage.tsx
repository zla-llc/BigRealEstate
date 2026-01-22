import { BoardStepModalHeader } from "../../headers";
import type { BoardModalPageProps } from "./types";

export const ImportLeadsModalPage = ({ onBackBtn }: BoardModalPageProps) => {
  return (
    <div className="full p-6 flex flex-col space-y-[15px]">
      <BoardStepModalHeader onBackBtn={onBackBtn} />
    </div>
  );
};
