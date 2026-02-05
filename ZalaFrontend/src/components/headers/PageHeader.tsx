import {
  EditablePageHeader,
  type EditablePageHeaderProps,
} from "./EditablePageHeader";

type PageHeaderProps = Omit<
  Omit<Omit<EditablePageHeaderProps, "value">, "setValue">,
  "editable"
> & { value?: string };

export const PageHeader = (props: PageHeaderProps) => {
  return (
    <EditablePageHeader
      value=""
      {...props}
      editable={false}
      setValue={() => {}}
    />
  );
};
