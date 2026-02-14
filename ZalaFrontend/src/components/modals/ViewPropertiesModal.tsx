import { Icons } from "../icons";
import { ModalHeader } from "../headers";
import { useViewPropertiesModalStore } from "../../stores";
import { BoardItemCard } from "../cards";

type ViewPropertiesModalProps = {
  onClose?: () => void;
};

export const ViewPropertiesModal = ({ onClose }: ViewPropertiesModalProps) => {
  const { title, properties, onClick } = useViewPropertiesModalStore();
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

      <div className="grid grid-cols-4 gap-x-[15px]">
        {properties.map((property) => (
          <BoardItemCard
            key={property.propertyId}
            stepId={-1}
            type="property"
            expanded
            propertyInfo={property}
            onClick={() => onClick(property.propertyId)}
          />
        ))}
      </div>
    </div>
  );
};
