export type UserListCardProps = {
  displayOverflowCount: number;
  overflowCount: number;
  spliceCount: number;

  onClick: (i: number) => void;
  onAdd?: () => void;
};

export type DashboardCardButtonProps = {
  text: string;
  visible?: boolean;
  onClick?: () => void;
};
