import { Icons } from "../icons";
import { ModalHeader } from "../headers";
import { useSelectedIdsStore, useViewPropertiesModalStore } from "../../stores";
import { BoardItemCard } from "../cards";
import clsx from "clsx";
import { ModalCenterButtons } from "../buttons";

type ViewPropertiesModalProps = {
  onClose?: () => void;
};

export const ViewPropertiesModal = ({ onClose }: ViewPropertiesModalProps) => {
  const { title, properties, primarySubmit, secondarySubmit, onClick } =
    useViewPropertiesModalStore();
  const selectedIdsStore = useSelectedIdsStore();

  return (
    <div className="full p-6 flex flex-col space-y-[30px]">
      <ModalHeader
        title={title ?? "View Properties"}
        actions={[
          onClose
            ? {
                type: "iconBtn",
                side: "left",
                iconBtnProps: {
                  name: Icons.Close,
                  onClick: onClose,
                },
              }
            : null,
        ]}
      />

      <div className={clsx("overflow-y-scroll px-[30px]")}>
        <div
          className={clsx(
            properties.length < 3
              ? "flex flex-row justify-center items-center space-x-[15px]"
              : "grid grid-cols-4 gap-x-[15px]",
          )}
        >
          {properties.map((property) => (
            <div key={property.propertyId} className="flex-[.25]">
              <BoardItemCard
                stepId={-1}
                selected={selectedIdsStore.properties.includes(
                  property.propertyId,
                )}
                type="property"
                expanded
                propertyInfo={property}
                onClick={() => onClick(property.propertyId)}
              />
            </div>
          ))}
        </div>

        {properties.length > 0 && (
          <div className="opacity-0 pointer-none:">
            <BoardItemCard
              stepId={-1}
              type="property"
              expanded
              propertyInfo={properties[0]}
            />
          </div>
        )}
      </div>

      {primarySubmit && (
        <ModalCenterButtons
          primary={primarySubmit}
          secondary={secondarySubmit}
        />
      )}
    </div>
  );
};
