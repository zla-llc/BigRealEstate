import { AAddressToIAddress, type AAddress, type IAddress } from "./Address";
import { AImageToIImage, type AImage, type IImage } from "./Image";

export enum UnitTypeEnum {
  Single = "Single",
  Double = "Double",
  Multi = "Multi",
}

export enum UnitKeys {
  SameAddress = "sameAddress",
  AptNum = "aptNum",
  Bedrooms = "bedrooms",
  Bath = "bath",
  Sqft = "sqft",
  Floors = "floors",
  Notes = "notes",
  UnitId = "unitId",
}

export enum PropertyKeys {
  Name = "propertyName",
  MlsNumber = "mlsNumber",
  Notes = "notes",
}

export type IProperty = {
  propertyId: number;
  propertyName: string;
  mlsNumber: string;
  notes: string;
  imageUrl: string;
  address: IAddress;
  units: IUnit[];
  images: IImage[];
};

export type IUnit = {
  unitId: number;
  aptNum: string;
  notes: string;
  bedrooms: number;
  bath: number;
  sqft: number;
};

export type AProperty = {
  property_id: number;
  property_name: string;
  mls_number: string;
  notes: string;
  image_url: string;
  address: AAddress;
  units: AUnit[];
  images: AImage[];
};

export type AUnit = {
  unit_id: number;
  apt_num: string;
  notes: string;
  bedrooms: number;
  bath: number;
  sqft: 0;
};

export const AUnitToIUnit = (body: AUnit): IUnit => {
  return {
    unitId: body.unit_id,
    aptNum: body.apt_num,
    notes: body.notes,
    bedrooms: body.bedrooms,
    bath: body.bath,
    sqft: body.sqft,
  };
};

export const APropertyToIProperty = (body: AProperty): IProperty => {
  return {
    propertyId: body.property_id,
    propertyName: body.property_name,
    mlsNumber: body.mls_number,
    notes: body.notes,
    imageUrl: body.image_url,
    address: AAddressToIAddress(body.address),
    units: body.units.map(AUnitToIUnit),
    images: body.images.map(AImageToIImage),
  };
};
