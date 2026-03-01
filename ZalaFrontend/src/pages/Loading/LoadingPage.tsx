import { Loader } from "../../components";

export const LoadingPage = ({ text }: { text?: string }) => {
  return (
    <div className="full flex items-center justify-center">
      <Loader darkMode text={text} />
    </div>
  );
};
