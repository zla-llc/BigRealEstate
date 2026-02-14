import { useRef, useState } from "react";
import { BoardStepModalHeader } from "../../headers";
import type { BoardModalPageProps } from "./types";
import { MenuButton } from "../../buttons";
import { ModalCenterButtons } from "../../buttons/ModalCenterButtons";
import { Icons } from "../../icons";
import { useAddBoardStepLeadStore } from "../../../stores";
import { useApi, useSnack } from "../../../hooks";
import sampleXLSX from "../../../assets/images/sampleXLSX.png";
import { Loader } from "../../feedback";

export const ImportLeadsModalPage = ({
  onBackBtn,
  onConfirm: parentOnConfirm,
}: BoardModalPageProps & { onConfirm: (newLeadIds?: number[]) => void }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { selectedBoardItemIds } = useAddBoardStepLeadStore();
  const { intakeCsv, apiResponseError } = useApi();
  const [successMsg] = useSnack();
  const [waiting, setWaiting] = useState<boolean >(false);

  const onPickFile = () => {
    // Allows re-selecting the same file twice in a row
    if (fileInputRef.current) fileInputRef.current.value = "";
    fileInputRef.current?.click();
  };

  const onConfirmUpload = async() => {
    if (!selectedFile) return;

    setWaiting(true);

    const response = await intakeCsv({ file: selectedFile });
    if (response.err || !response.data) {
      apiResponseError("importing csv leads", response.err);
      return;
    }

    const newLeadIds = [
      ...(response.data.leads_created ?? []),
      ...(response.data.leads_updated ?? []),
      ...(response.data.leads_unchanged ?? []),
    ];
    const mergedLeadIds = [...selectedBoardItemIds, ...newLeadIds];
    parentOnConfirm(mergedLeadIds);
    successMsg("Successfully imported leads from CSV file");
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);

    if (!file) return;

  };
  return (
    <div className="full p-6 flex flex-col space-y-[15px]">
      <BoardStepModalHeader 
        onBackBtn={onBackBtn} 
      />
      <div className="w-full flex flex-col items-center justify-center ">
        <span className="text-lg text-center font-bold">
          {"Import Lead(s)"}
        </span>    
      </div>
      {waiting ? (
        <div className="grow-1 relative flex items-center justify-center">
          <Loader darkMode={true} />
        </div>
      ) : (
        <div className="grow-1 relative flex flex-col items-center gap-3 text-center">
          <p>
            Make sure your sheet has the following headers: first_name, last_name,
            email, phone_number
          </p>
          <p>
            Then export as csv and upload it here!
          </p>
          <p className="text-secondary-50 text-md line-clamp-2 mt-4">
              <b>Example sheet</b> 
          </p>
          <div className="flex flex-col items-start gap-3">
            <img src={sampleXLSX} alt="" />
          </div>
          <div className="inline-flex items-center gap-3 mt-9">
            <MenuButton
              onClick={onPickFile}
              text={"Select File"}
              icon={Icons.File}
            />
          </div>
          <div className="text-sm text-black/70 whitespace-nowrap">
            {selectedFile ? selectedFile.name : "No file selected"}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".csv"
            onChange={onFileChange}
          />
        </div>
      )}
      <ModalCenterButtons
        primary={{
          text: "Upload Leads",
          icon: Icons.Upload,
          onClick: onConfirmUpload,
        }}
      />
      
    </div>

  );
};
