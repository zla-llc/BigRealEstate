import { forwardRef, type PropsWithChildren } from "react";
import { PageHeader } from "../headers";
import { Icons } from "../icons";
import { Button, type ButtonProps } from "../buttons";

export type DashboardCardProps = {
  title: string;
  onAdd?: () => void;
  btnProps?: ButtonProps;
};

export const DashboardCard = forwardRef<
  HTMLDivElement,
  PropsWithChildren<DashboardCardProps>
>(({ title, btnProps, onAdd, children }, ref) => {
  return (
    <div
      ref={ref}
      className="card-base box-shadow w-full flex flex-col p-[30px] gap-y-[15px] transition-[height] duration-500"
    >
      <div className="w-full flex items-center justify-center">
        <PageHeader
          actions={[
            onAdd
              ? {
                  type: "iconBtn",
                  side: "right",
                  iconBtnProps: { name: Icons.Add, onClick: onAdd },
                }
              : null,
          ]}
          title={title}
          disablePadding
          transparent
        />
      </div>

      {children}

      {btnProps && (
        <div className="flex justify-center">
          <div className="flex-1 max-w-[300px]">
            <Button {...btnProps} />
          </div>
        </div>
      )}
    </div>
  );
});
