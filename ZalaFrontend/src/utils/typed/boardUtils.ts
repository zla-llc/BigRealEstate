import type { IBoardStepCard, ILead, IPropertyCard } from "../../interfaces";

export const getItemsFromStep = (
  step: IBoardStepCard
): [(IPropertyCard | ILead)[], "property" | "lead"] => {
  const allItems = step.properties.length > 0 ? step.properties : step.leads;
  const itemType = step.properties.length > 0 ? "property" : "lead";
  return [allItems, itemType];
};

export const getItemIdsFromStep = (
  step: IBoardStepCard
): [number[], (IPropertyCard | ILead)[], "property" | "lead"] => {
  const [allItems, itemType] = getItemsFromStep(step);
  return [
    allItems.map((item) =>
      itemType === "property"
        ? (item as IPropertyCard).propertyId
        : (item as ILead).leadId
    ),
    allItems,
    itemType,
  ];
};

export const getBoardItemId = (
  item: IPropertyCard | ILead,
  knownType?: "lead" | "property"
) => {
  if (knownType) {
    if (knownType === "lead") return (item as ILead).leadId;
    if (knownType === "property") return (item as IPropertyCard).propertyId;
  }

  if ((item as Partial<ILead>)?.leadId) return (item as ILead).leadId;
  if ((item as Partial<IPropertyCard>)?.propertyId)
    return (item as IPropertyCard).propertyId;

  return -1;
};
