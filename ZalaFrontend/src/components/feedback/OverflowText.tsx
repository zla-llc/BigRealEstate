type OverflowTextProps = {
  overflowCount: number;
  text?: string;
};

export const OverflowText = ({ overflowCount, text }: OverflowTextProps) => {
  return overflowCount > 0 ? (
    <div className="flex justify-center items-center">
      {text ?? `+ ${overflowCount} More`}
    </div>
  ) : (
    <div />
  );
};
