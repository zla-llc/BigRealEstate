export type IImage = {
  leadImageId?: number;
  propertyImageId?: number;
  imageUrl: string;
  caption?: string;
  sortOrder?: number;
};

export type AImage = {
  lead_image_id?: number;
  property_image_id?: number;
  image_url: string;
  caption?: string | null;
  sort_order?: number | null;
};

export type IImageAsset = { file?: File; image?: IImage; order: number };

export const AImageToIImage = (body: AImage): IImage => ({
  leadImageId: body.lead_image_id ?? undefined,
  propertyImageId: body.property_image_id ?? undefined,
  imageUrl: body.image_url,
  caption: body.caption ?? undefined,
  sortOrder: body.sort_order ?? undefined,
});
