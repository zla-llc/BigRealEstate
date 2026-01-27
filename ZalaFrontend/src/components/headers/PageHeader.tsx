import {
  EditablePageHeader,
  type EditablePageHeaderProps,
} from "./EditablePageHeader";

type PageHeaderProps = Omit<
  Omit<Omit<EditablePageHeaderProps, "value">, "setValue">,
  "editable"
>;

export const PageHeader = (props: PageHeaderProps) => {
  return (
    <EditablePageHeader
      {...props}
      editable={false}
      value=""
      setValue={() => {}}
    />
  );
};
