import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import {
  SignupPage,
  LoginPage,
  KanbanBoardPage,
  LeadSearchPage,
  CampaignPage,
  NotFoundPage,
  TestEmailPage,
  CampaignEmailDemoPage,
  PastCampaignsPage,
  DashboardPage,
  SMTPTestPage,
  TeamInviteTestPage,
  SingleBoardPage,
} from "../pages";
import { RootLayout } from "../layouts";
import { useAuthStore } from "../stores";

export const NavigationProvider = () => {
  const user = useAuthStore((state) => state.user);
  // const NavToLeadSearch = () => <Navigate to={"/search"} />;
  const NavToDashboard = () => <Navigate to={"/dashboard"} />;
  const NavTo404 = () => <Navigate to={"/404"} />;
  const NavToLogin = () => <Navigate to={"/login"} />;
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route
            path="/login"
            element={user ? <NavToDashboard /> : <LoginPage />}
          />
          <Route
            path="/signup"
            element={user ? <NavToDashboard /> : <SignupPage />}
          />

          {!user && <Route path="*" element={<NavToLogin />} />}

          <Route index path="/" element={<NavToDashboard />} />

          <Route path="/campaigns">
            <Route index element={<PastCampaignsPage />} />
            <Route path=":campaignId" element={<CampaignPage />} />
          </Route>

          <Route path="/demos">
            <Route path="campaign" element={<CampaignEmailDemoPage />} />
            <Route path="email" element={<TestEmailPage />} />
            <Route path="smtp" element={<SMTPTestPage />} />
            <Route path="team" element={<TeamInviteTestPage />} />
            <Route path="board" element={<KanbanBoardPage />} />
          </Route>

          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/search" element={<LeadSearchPage />} />
          <Route path="/board/:boardId" element={<SingleBoardPage />} />

          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<NavTo404 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
