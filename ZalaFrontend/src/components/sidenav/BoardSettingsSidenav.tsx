import clsx from "clsx";
import { Button, IconButtonVariant } from "../buttons";
import { EditablePageHeader } from "../headers";
import { Icons } from "../icons";
import { useBoardSettingsSidenav } from "../../hooks";
import { SwitchInput, TextInput } from "../inputs";

export const BoardSettingsSidenav = () => {
  const {
    boardName,
    setBoardName,
    boardType,
    onSwitchClick,
    closeSidenav,
    onSave,
  } = useBoardSettingsSidenav();
  return (
    <div className={clsx("full p-[30px] flex flex-col")}>
      <div className="grow w-ful flex flex-col gap-y-[30px]">
        <EditablePageHeader
          value="Board Settings"
          setValue={() => {}}
          editable={false}
          centerText
          disablePadding
          actions={[
            {
              side: "left",
              type: "iconBtn",
              iconBtnProps: {
                name: Icons.Close,
                variant: IconButtonVariant.Secondary,
                onClick: closeSidenav,
              },
            },
          ]}
        />

        <TextInput value={boardName} setValue={setBoardName} />

        <SwitchInput
          checked={boardType === "properties"}
          onClick={onSwitchClick("properties")}
          text="Properties Board"
        />
        <SwitchInput
          checked={boardType === "lead"}
          onClick={onSwitchClick("lead")}
          text="Leads Board"
        />
      </div>
      <div className="">
        <Button text="Save Settings" onClick={onSave} />
      </div>
    </div>
  );
};
