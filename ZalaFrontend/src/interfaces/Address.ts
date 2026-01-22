export enum AddressKeys {
  Street1 = "street1",
  Street2 = "street2",
  City = "city",
  State = "state",
  Zip = "zipcode",
}

export type AAddress = {
  street_1: string;
  street_2: string;
  city: string;
  state: string;
  zipcode: string;
  lat: number;
  long: number;
  address_id: number;
};

export type IAddress = {
  addressId: number;
  street1: string;
  street2: string;
  city: string;
  state: string;
  zipcode: string;
  lat: number;
  long: number;
};

export const AAddressToIAddress = (body: AAddress): IAddress => ({
  addressId: body.address_id ?? "",
  street1: body.street_1 ?? "",
  street2: body.street_2 ?? "",
  city: body.city ?? "",
  state: body.state ?? "",
  zipcode: body.zipcode ?? "",
  lat: body.lat,
  long: body.long,
});
