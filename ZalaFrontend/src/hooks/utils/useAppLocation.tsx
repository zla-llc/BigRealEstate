import { useLocation } from "react-router";
import { NavigationPath } from "../../providers";

export const useAppLocation = () => {
  const { pathname } = useLocation();
  const isDashboardPage = pathname === NavigationPath.Dashboard;
  const isSearchPage = pathname === NavigationPath.Search;

  return {
    pathname,

    isDashboardPage,
    isSearchPage,
  };
};
