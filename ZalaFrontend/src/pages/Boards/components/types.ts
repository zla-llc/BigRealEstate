import type { BoardStepCard, LeadCard, PropertyCard } from "../../../interfaces";

export type LeadComposerState = {
  business: string;
  person_type: string;
  website: string;
  license_num: string;
  notes: string;
};

export type PropertyComposerState = {
  property_name: string;
  notes: string;
  mls_number: string;
  address: {
    street_1: string;
    street_2: string;
    city: string;
    state: string;
    zipcode: string;
  };
};

export type AddressResponse = PropertyComposerState["address"] & {
  address_id: number;
};

export type PendingImage = {
  file: File;
  previewUrl: string;
};

export type GalleryImage = {
  url: string;
  id?: number;
};

export const createDefaultLeadForm = (): LeadComposerState => ({
  business: "",
  person_type: "",
  website: "",
  license_num: "",
  notes: "",
});

export const createDefaultPropertyForm = (): PropertyComposerState => ({
  property_name: "",
  notes: "",
  mls_number: "",
  address: {
    street_1: "",
    street_2: "",
    city: "",
    state: "",
    zipcode: "",
  },
});

// Re-export interface types for convenience
export type { BoardStepCard, LeadCard, PropertyCard };
