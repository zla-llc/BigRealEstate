import { useDashboardPage } from "../../../hooks";
import { ModalCenterButtons } from "../../buttons";
import { ModalHeader } from "../../headers";
import { Icons } from "../../icons";
import { TextInput } from "../../inputs";

export const InviteMemberModal = () => {
  const { inviteEmail, setInviteEmail, onInvite, toggleModalOpen } =
    useDashboardPage();

  return (
    <div className="full p-6 flex flex-col space-y-[30px]">
      <ModalHeader
        title="Send Team Invite"
        actions={[
          {
            type: "iconBtn",
            side: "left",
            iconBtnProps: {
              name: Icons.Close,
              onClick: () => toggleModalOpen(false),
            },
          },
        ]}
      />
      <div className="flex flex-col items-center">
        <p className="text-lg">Invite a new person to your team.</p>
        <p className="text-lg">Enter their email below to send an invite.</p>
      </div>

      <div className="grow-1 flex flex-col items-center justify-center">
        <div className="w-[75%]">
          <TextInput
            label="Email"
            value={inviteEmail}
            setValue={setInviteEmail}
          />
        </div>
      </div>

      <ModalCenterButtons
        primary={{ text: "Send Invite", onClick: onInvite }}
      />
    </div>
  );
};
