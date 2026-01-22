type LeadsSelectedHeaderProps = {
  value: number;
  showZero?: boolean;
};

export const LeadsSelectedHeader = ({
  value,
  showZero,
}: LeadsSelectedHeaderProps) => {
  return value === 0 && showZero ? (
    <span className="text-md text-secondary-50">Remove all leads</span>
  ) : (
    <span className="text-md text-secondary-50">
      <span className="font-bold">{value}</span> Leads Selected
    </span>
  );
};
