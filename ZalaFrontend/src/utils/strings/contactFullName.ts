import type { IContact, TeamMember } from "../../interfaces";

export const contactFullName = (contact?: IContact) =>
  `${contact?.firstName} ${contact?.lastName}`.trim();

export const teamMemberFullName = (
  member: TeamMember | undefined,
  defaultTxt: string,
) => {
  const fullName =
    `${member?.user.first_name} ${member?.user.last_name}`.trim();
  return !member || fullName.length > 0 ? fullName : defaultTxt;
};
