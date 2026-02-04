import {
  EditablePageHeader,
  type EditablePageHeaderProps,
} from "./EditablePageHeader";

type PageHeaderProps = Omit<
  Omit<EditablePageHeaderProps, "setValue">,
  "editable"
>;

export const PageHeader = (props: PageHeaderProps) => {
  return <EditablePageHeader {...props} editable={false} setValue={() => {}} />;
};
