import React, { type ForwardedRef } from "react";
import { EditablePageHeader } from "../../../components";

type DashboardHeaderProps = {
  newTeamName: string;
  isUserAdmin: boolean;
  displayOnly?: boolean;
  setNewTeamName?: (v: string) => void;
};

export const DashboardHeader = React.forwardRef<
  HTMLDivElement,
  DashboardHeaderProps
>(
  (
    {
      newTeamName,
      displayOnly,
      isUserAdmin,
      setNewTeamName = () => {},
    }: DashboardHeaderProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    return (
      <EditablePageHeader
        ref={ref}
        title="Team Name:"
        nonEditableText={newTeamName}
        value={newTeamName}
        setValue={displayOnly ? () => {} : setNewTeamName}
        editable={displayOnly ? false : isUserAdmin}
        inputProps={{ placeholder: "Ex: The best team ever" }}
      />
    );
  },
);
