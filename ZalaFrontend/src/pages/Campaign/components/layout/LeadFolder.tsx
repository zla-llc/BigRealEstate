import { type PropsWithChildren } from "react";
import { AGENT_IMAGES_ARR } from "../../../../assets";

export const LeadFolder = ({
  i,
  children,
}: PropsWithChildren<{ i: number }>) => {
  return (
    <div className="relative w-full h-full flex flex-row items-center space-x-[30px]">
      <div className="sticky bottom-0 flex items-center justify-center pl-[30px]">
        <div className="w-[250px] h-[250px] rounded-[15px] overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={AGENT_IMAGES_ARR[i % AGENT_IMAGES_ARR.length]}
            alt={`Lead-${i + 1}-img`}
          />
        </div>
      </div>
      <div className="w-full h-full flex flex-col items-center relative">
        {children}
      </div>
    </div>
  );
};
