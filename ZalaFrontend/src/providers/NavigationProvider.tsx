import { Navigate, Route, Routes, useLocation } from "react-router";
import TeamInviteTestPage from "../pages/TeamInviteTest/TeamInviteTestPage";
import { RootLayout } from "../layouts";
import { useAuthStore } from "../stores";
import LoginPage from "../pages/Auth/Login/LoginPage";
import SignupPage from "../pages/Auth/Signup/SignupPage";
import KanbanBoardPage from "../pages/Boards/KanbanBoardPage";
import NotFoundPage from "../pages/NotFound/NotFoundPage";
import TestEmailPage from "../pages/TestEmail/TestEmailPage";
import CampaignEmailDemoPage from "../pages/CampaignEmailDemo/CampaignEmailDemoPage";
import PastCampaignsPage from "../pages/PastCampaigns/PastCampaignsPage";
import SMTPTestPage from "../pages/SMTPTest/SMTPTestPage";
import { AnimatePresence } from "framer-motion";
import {
  CampaignPage,
  DashboardPage,
  LeadSearchPage,
  SingleBoardPage,
} from "../pages";
import { NavigationPath } from "./types";

/**
 * Handles which components and pages to show from URL.
 *
 * @returns {BrowserRouter}
 */
export const NavigationProvider = () => {
  const user = useAuthStore((state) => state.user);
  // const NavToLeadSearch = () => <Navigate to={"/search"} />;
  const NavToDashboard = () => <Navigate to={"/dashboard"} />;
  const NavTo404 = () => <Navigate to={"/404"} />;
  const NavToLogin = () => <Navigate to={"/login"} />;
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<RootLayout />}>
          <Route
            path={NavigationPath.Login}
            element={user ? <NavToDashboard /> : <LoginPage />}
          />
          <Route
            path={NavigationPath.SignUp}
            element={user ? <NavToDashboard /> : <SignupPage />}
          />

          {!user && (
            <Route path={NavigationPath.All} element={<NavToLogin />} />
          )}

          <Route
            index
            path={NavigationPath.Root}
            element={<NavToDashboard />}
          />

          <Route path={NavigationPath.Campaigns}>
            <Route index element={<PastCampaignsPage />} />
            <Route path=":campaignId" element={<CampaignPage />} />
          </Route>

          <Route path={NavigationPath.Demos}>
            <Route path="campaign" element={<CampaignEmailDemoPage />} />
            <Route path="email" element={<TestEmailPage />} />
            <Route path="smtp" element={<SMTPTestPage />} />
            <Route path="team" element={<TeamInviteTestPage />} />
            <Route path="board" element={<KanbanBoardPage />} />
          </Route>

          <Route path={NavigationPath.Dashboard} element={<DashboardPage />} />
          <Route path={NavigationPath.Search} element={<LeadSearchPage />} />
          <Route
            path={NavigationPath.SingleBoard}
            element={<SingleBoardPage />}
          />

          <Route path={NavigationPath.NotFound} element={<NotFoundPage />} />
          <Route path={NavigationPath.All} element={<NavTo404 />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};
