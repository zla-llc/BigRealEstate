import { DashboardCard, type DashboardCardProps } from "./DashboardCard";
import type { IProperty } from "../../interfaces";
import { BoardItemCard } from "./BoardItemCard";
import { forwardRef } from "react";

type PropertiesListCardProps = DashboardCardProps & {
  properties: IProperty[];
  overflowCount?: number;
  onClick?: (propertyId: number) => void;
};

export const PropertiesListCard = forwardRef<
  HTMLDivElement,
  PropertiesListCardProps
>((props, ref) => {
  const { properties, overflowCount = 0, onClick = () => {} } = props;
  return (
    <DashboardCard ref={ref} {...props}>
      <div className="grid grid-cols-2 gap-x-3.75">
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
});
