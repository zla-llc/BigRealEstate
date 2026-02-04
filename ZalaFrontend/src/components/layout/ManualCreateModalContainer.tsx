import { type PropsWithChildren } from "react";

type ManualCreateModalContainerProps = PropsWithChildren;

export const ManualCreateModalContainer = ({
  children,
}: ManualCreateModalContainerProps) => {
  return (
    <div className="grow-1 relative">
      <div className="absolute-fill flex flex-col space-y-[15px] overflow-y-scroll px-[15px] pt-[25px] pb-[50px]">
        {children}
      </div>
    </div>
  );
};
