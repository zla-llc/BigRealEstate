import { DashboardCard, type DashboardCardProps } from "./DashboardCard";
import type { IProperty } from "../../interfaces";

type PropertiesListCardProps = DashboardCardProps & {
  properties: IProperty[];
};

export const PropertiesListCard = (props: PropertiesListCardProps) => {
  const { properties } = props;
  return (
    <DashboardCard {...props}>
      {properties.map((property) => (
        <div
          key={property.propertyId}
          className="card-base-secondary box-shadow p-[15px]"
        ></div>
      ))}
    </DashboardCard>
  );
};
