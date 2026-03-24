import Portal from "@mui/material/Portal";
import clsx from "clsx";
import type { PropsWithChildren } from "react";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
};

type ModalComponentProps = ModalProps & {
  width?: string;
  height?: string;
  blankModal?: boolean;
};

export const Modal = ({
  open,
  width = "75vw",
  height = "100%",
  onClose,
  children,
  blankModal = false,
}: PropsWithChildren<ModalComponentProps>) => {
  return (
    open && (
      <Portal>
        <div
          onClick={onClose}
          className={clsx(
            "full bg-secondary-50 z-200 fixed top-0 left-0",
            blankModal ? "" : "p-[60px]",
          )}
        >
          {blankModal ? (
            <div className="full relative">{children}</div>
          ) : (
            <div className="full relative">
              <div className="absolute-fill z-[12] pointer-events-auto flex items-center justify-center">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="card-base box-shadow p-5"
                  style={{
                    width,
                    maxWidth: width,
                    height,
                  }}
                >
                  {children}
                </div>
              </div>
            </div>
          )}
        </div>
      </Portal>
    )
  );
};
