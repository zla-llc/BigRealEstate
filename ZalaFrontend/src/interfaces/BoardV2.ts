import { AAddressToIAddress, type AAddress, type IAddress } from "./Address";
import { AImageToIImage, type AImage, type IImage } from "./Image";
import { ALeadToILead, type ALead, type ILead } from "./Lead";

export type IBoardType = "properties" | "lead";

/**
 * Shared user summary types (for BoardSummary.user and LeadCard.created_by_user)
 */
export type IBoardUser = {
  userId: number;
  username?: string;
  profilePic?: string;
};

export type ABoardUser = {
  user_id: number;
  username?: string | null;
  profile_pic?: string | null;
};

export const ABoardUserToIBoardUser = (body: ABoardUser): IBoardUser => ({
  userId: body.user_id,
  username: body.username ?? undefined,
  profilePic: body.profile_pic ?? undefined,
});

/**
 * Address types
 */
// export type ILeadAddress = {
//   addressId?: number;
//   street1?: string;
//   city?: string;
//   state?: string;
//   zipcode?: string;
// };

// export type ALeadAddress = {
//   address_id?: number | null;
//   street_1?: string | null;
//   city?: string | null;
//   state?: string | null;
//   zipcode?: string | null;
// };

/**
 * Board summary types
 */
export type IBoardSummary = {
  boardId: number;
  boardName: string;
  boardType: string
  userId?: number;
  user?: IBoardUser;
};

export type ABoardSummary = {
  board_id: number;
  board_name: string;
  board_type: string;
  user_id?: number | null;
  user?: ABoardUser | null;
};

export const ABoardSummaryToIBoardSummary = (
  body: ABoardSummary
): IBoardSummary => ({
  boardId: body.board_id,
  boardName: body.board_name,
  boardType: body.board_type,
  userId: body.user_id ?? undefined,
  user: body.user ? ABoardUserToIBoardUser(body.user) : undefined,
});

/**
 * Lead card types
 */
// export type ILeadCard = {
//   leadId: number;
//   personType?: string;
//   business?: string;
//   website?: string;
//   licenseNum?: string;
//   notes?: string;
// imageUrl?: string;
// images?: ICardImage[];
//   createdBy?: number;
//   createdByUser?: IBoardUser;
//   contact?: IContact;
//   address?: ILeadAddress;
// };

// export type ALeadCard = {
//   lead_id: number;
//   person_type?: string | null;
//   business?: string | null;
//   website?: string | null;
//   license_num?: string | null;
//   notes?: string | null;
//   image_url?: string | null;
//   images?: ACardImage[];
//   created_by?: number | null;
//   created_by_user?: ABoardUser | null;
//   contact?: AContact | null;
//   address?: ALeadAddress | null;
// };

/**
 * Property card types
 */
export type IPropertyCard = {
  propertyId: number;
  propertyName: string;
  mlsNumber?: string;
  notes?: string;
  addressId?: number;
  imageUrl?: string;
  images?: IImage[];
  address?: IAddress;
};

export type APropertyCard = {
  property_id: number;
  property_name: string;
  mls_number?: string | null;
  notes?: string | null;
  address_id?: number | null;
  image_url?: string | null;
  images?: AImage[];
  address?: AAddress | null;
};

export const APropertyCardToIPropertyCard = (
  body: APropertyCard
): IPropertyCard => ({
  propertyId: body.property_id,
  propertyName: body.property_name,
  mlsNumber: body.mls_number ?? undefined,
  notes: body.notes ?? undefined,
  addressId: body.address_id ?? undefined,
  imageUrl: body.image_url ?? undefined,
  images: body.images ? body.images.map(AImageToIImage) : undefined,
  address: body.address ? AAddressToIAddress(body.address) : undefined,
});

/**
 * Board step card types
 */
export type IBoardStepCard = {
  boardStepId: number;
  boardId: number;
  boardColumn: number;
  stepName: string;
  board?: IBoardSummary;
  leads: ILead[];
  properties: IPropertyCard[];
};

export type ABoardStepCard = {
  board_step_id: number;
  board_id: number;
  board_column: number;
  step_name: string;
  board?: ABoardSummary;
  leads: ALead[];
  properties: APropertyCard[];
};

export const ABoardStepCardToIBoardStepCard = (
  body: ABoardStepCard
): IBoardStepCard => ({
  boardStepId: body.board_step_id,
  boardId: body.board_id,
  boardColumn: body.board_column,
  stepName: body.step_name,
  board: body.board ? ABoardSummaryToIBoardSummary(body.board) : undefined,
  leads: body.leads.map(ALeadToILead),
  properties: body.properties.map(APropertyCardToIPropertyCard),
});

/**
 * Kanban board types
 */
export type IKanbanBoard = IBoardSummary & {
  boardSteps: IBoardStepCard[];
};

export type AKanbanBoard = ABoardSummary & {
  board_steps: ABoardStepCard[];
};

export const AKanbanBoardToIKanbanBoard = (
  body: AKanbanBoard
): IKanbanBoard => ({
  ...ABoardSummaryToIBoardSummary(body),
  boardSteps: body.board_steps.map(ABoardStepCardToIBoardStepCard),
});
