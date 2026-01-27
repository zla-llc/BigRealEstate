import { useState } from "react";
import {
  AnnouncmentsCard,
  EditablePageHeader,
  LeaderBoardsCard,
  PropertiesListCard,
  UserListCard,
} from "../../components";

export const DashboardPage = () => {
  const [teamName, setTeamName] = useState("");

  return (
    <div className="flex flex-col gap-y-[60px] flex-1 p-[60px] overflow-y-scroll">
      <div className="w-full px-[60px]">
        <EditablePageHeader
          title="Team Name:"
          value={teamName}
          setValue={setTeamName}
          inputProps={{ placeholder: "Ex: The best team ever" }}
        />
      </div>

      <div className="flex flex-row gap-x-[60px]">
        <div className="w-[40%]">
          <UserListCard
            title="Admins:"
            users={Array(10).fill("CT")}
            btnProps={{ text: "View all" }}
            onAdd={() => {}}
          />
        </div>
        <div className="flex-grow ">
          <UserListCard
            title="Team Members:"
            users={Array(5).fill("CT")}
            btnProps={{ text: "View all" }}
            onAdd={() => {}}
          />
        </div>
      </div>

      <div className="flex flex-row gap-x-[60px]">
        <div className="w-[70%]">
          <AnnouncmentsCard
            title="Announcments:"
            messages={Array(4)
              .fill(1)
              .map((_, i) => ({
                messageId: i,
                title: "Announcment " + i,
                message: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
              }))}
            onAdd={() => {}}
            btnProps={{ text: "View all" }}
          />
        </div>
        <div className="flex-grow">
          <LeaderBoardsCard
            title="Team Leaderboard:"
            btnProps={{ text: "View all" }}
            users={Array(5).fill("CT")}
          />
        </div>
      </div>

      <div className="flex flex-row gap-[60px]">
        <div className="flex-1">
          <PropertiesListCard
            properties={[]}
            title="Team Properties:"
            onAdd={() => {}}
            btnProps={{ text: "View all" }}
          />
        </div>
        <div className="flex-1">
          <PropertiesListCard
            properties={[]}
            title="Team Properties:"
            onAdd={() => {}}
            btnProps={{ text: "View all" }}
          />
        </div>
      </div>
    </div>
  );
};
