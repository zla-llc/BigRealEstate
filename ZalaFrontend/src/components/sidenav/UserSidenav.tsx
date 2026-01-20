import { Button, MenuButton } from "../buttons";
import { useAppNavigation, useLogout } from "../../hooks";
import { useAuthStore, useSideNavControlStore } from "../../stores";
import Avatar from "@mui/material/Avatar";
import { COLORS } from "../../config";
import { GoogleRequiredCard } from "../cards";

export const UserSidenav = () => {
  const user = useAuthStore((state) => state.user);
  const closeSideNav = useSideNavControlStore((state) => state.close);
  const logout = useLogout();
  const {
    toPastCampaigns,
    toBoardsPage,
    toCampaignEmailTestPage,
    toEmailTestPage,
    toSMTPTestPage,
  } = useAppNavigation();

  const onLogout = () => (closeSideNav(), logout());

  const avatarSize = 150;
  const firstInitial =
    user?.contact?.firstName?.[0] ?? user?.username?.[0] ?? "?";
  const lastInitial = user?.contact?.lastName?.[0] ?? "";
  return (
    user && (
      <div className="w-full h-full flex flex-col space-y-[30px]">
        <div className="w-full flex flex-col flex-1 space-y-[30px] overflow-y-scroll p-[30px]">
          <div className="w-full flex flex-col items-center justify-center">
            <Avatar
              sx={{
                width: avatarSize,
                height: avatarSize,
                bgcolor: COLORS.secondary50,
                fontSize: avatarSize * 0.25,
                fontWeight: "bold",
              }}
            >
              {firstInitial}
              {lastInitial}
            </Avatar>
            <div className="flex flex-col items-center justify-center mt-[10px]">
              <p className="text-secondary text-xl font-bold">
                {user.username}
              </p>
              <p className="text-secondary-50">
                {user.contact?.firstName} {user.contact?.lastName}
              </p>
            </div>
          </div>

          <div className="space-y-[15px]">
            {!user.gmailConnected && <GoogleRequiredCard user={user} />}

            <MenuButton
              text="Past campaigns"
              onClick={() => (closeSideNav(), toPastCampaigns())}
            />

            <MenuButton
              text="Boards V1 Demo"
              onClick={() => (closeSideNav(), toBoardsPage())}
            />

            {user.gmailConnected && (
              <MenuButton
                text="Emails Demo"
                onClick={() => (closeSideNav(), toEmailTestPage())}
              />
            )}

            {user.gmailConnected && (
              <MenuButton
                text="Campaign Emails Demo"
                onClick={() => (closeSideNav(), toCampaignEmailTestPage())}
              />
            )}

            <MenuButton
              text="SMTP Email Test"
              onClick={() => (closeSideNav(), toSMTPTestPage())}
            />
          </div>
        </div>
        <div className="p-[30px]">
          <Button text="Logout" onClick={onLogout} />
        </div>
      </div>
    )
  );
};
