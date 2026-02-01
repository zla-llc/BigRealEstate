import { useRef, useState } from "react";
import { BoardStepModalHeader } from "../../headers";
import type { BoardModalPageProps } from "./types";
import { MenuButton } from "../../buttons";
import { ModalCenterButtons } from "../../buttons/ModalCenterButtons";
import { Icons } from "../../icons";
import { BoardModal } from "./BoardModal";
import { useAddBoardStepLeadStore } from "../../../stores";
import { useApi, useSnack } from "../../../hooks";

export const ImportLeadsModalPage = ({
  onBackBtn,
  onConfirm: parentOnConfirm,
}: BoardModalPageProps & { onConfirm: (newLeadIds?: number[]) => void }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { selectedBoardItemIds, editBoardItemId } = useAddBoardStepLeadStore();
  const { intakeCsv, apiResponseError } = useApi();
  const [successMsg] = useSnack();

  const onPickFile = () => {
    // Allows re-selecting the same file twice in a row
    if (fileInputRef.current) fileInputRef.current.value = "";
    fileInputRef.current?.click();
  };

  const onConfirmUpload = async() => {
    if (!selectedFile) return;

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

    // TODO: upload/parse here
    // Example:
    // const formData = new FormData();
    // formData.append("file", file);
    // await fetch("/api/leads/import", { method: "POST", body: formData });
  };
  return (
    <div className="full p-6 flex flex-col space-y-[15px]">
      <BoardStepModalHeader onBackBtn={onBackBtn} />
      <div className="grow-1 relative flex items-center gap-3">
        <div className="inline-flex items-center justify-center ">
          <MenuButton
            onClick={onPickFile} 
            text={"Upload File"}
          />
        </div>

        <span className="text-sm text-black/70 truncate max-w-[60%]">
          {selectedFile ? selectedFile.name : "No file selected"}
        </span>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".csv"
          onChange={onFileChange}
        />
      </div>
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
