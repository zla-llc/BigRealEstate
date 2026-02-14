import { DashboardCard, type DashboardCardProps } from "./DashboardCard";
import type { IProperty } from "../../interfaces";
import { BoardItemCard } from "./BoardItemCard";

type PropertiesListCardProps = DashboardCardProps & {
  properties: IProperty[];
  overflowCount?: number;
  onClick?: (propertyId: number) => void;
};

export const PropertiesListCard = (props: PropertiesListCardProps) => {
  const { properties, overflowCount = 0, onClick = () => {} } = props;
  return (
    <DashboardCard {...props}>
      <div className="grid grid-cols-2 gap-x-[15px]">
        {properties.map((property) => (
          <div key={property.propertyId} className="">
            <BoardItemCard
              expanded
              stepId={-1}
              type={"property"}
              propertyInfo={property}
              onClick={() => onClick(property.propertyId)}
            />
          </div>
        ))}
      </div>

      {overflowCount > 0 ? (
        <div className="flex justify-center items-center">
          + {overflowCount} More
        </div>
      ) : (
        <div />
      )}
    </DashboardCard>
  );
};
