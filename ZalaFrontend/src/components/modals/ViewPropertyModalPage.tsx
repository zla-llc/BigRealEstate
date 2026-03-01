import { useViewPropertyModalPage } from "../../hooks";
import { ModalHeader } from "../headers";
import { Icons } from "../icons";
import { ModalButtons, ModalCenterButtons } from "../buttons";
import { ImageCarousel } from "../layout";

type ViewPropertyModalPageProps = {
  onClose?: () => void;
};

export const ViewPropertyModalPage = ({
  onClose,
}: ViewPropertyModalPageProps) => {
  const {
    title,
    isClosed,
    property,
    primaryBtn,
    secondaryBtn,
    images,
    onEdit,
    toUrl,
  } = useViewPropertyModalPage();

  return (
    <div className="full p-6 flex flex-col space-y-7.5">
      <ModalHeader
        title={title}
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
          onEdit
            ? {
                type: "iconBtn",
                side: "right",
                iconBtnProps: {
                  name: Icons.Edit,
                  onClick: onEdit,
                },
              }
            : null,
        ]}
      />

      {property ? (
        <div className="grow">
          <div className="flex flex-row space-x-7.5">
            <div className="flex-1 space-y-3.75">
              <ImageCarousel
                images={images.map((img) => toUrl(img.imageUrl))}
              />
            </div>
            <div className="flex-1">
              {isClosed && (
                <div className="">
                  <div className="border-2 bg-white rounded-md flex flex-row justify-center items-center">
                    <p className="text-md ">Sold</p>
                  </div>
                </div>
              )}
              <p className="text-xl text-secondary">{property.propertyName}</p>
              <p className="text-lg text-secondary-50">{property.notes}</p>
            </div>
          </div>
        </div>
      ) : null}

      {primaryBtn && !secondaryBtn && (
        <ModalCenterButtons primary={primaryBtn} />
      )}

      {primaryBtn && secondaryBtn && (
        <ModalButtons primary={primaryBtn} secondary={secondaryBtn} />
      )}
    </div>
  );
};
