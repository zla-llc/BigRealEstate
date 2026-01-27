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
  AllBoardsPage,
  DashboardPage,
} from "../pages";
import { RootLayout } from "../layouts";
import { useAuthStore } from "../stores";

export const NavigationProvider = () => {
  const user = useAuthStore((state) => state.user);
  const NavToLeadSearch = () => <Navigate to={"/"} />;
  const NavTo404 = () => <Navigate to={"/404"} />;
  const NavToLogin = () => <Navigate to={"/login"} />;
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route
            path="/login"
            element={user ? <NavToLeadSearch /> : <LoginPage />}
          />
          <Route
            path="/signup"
            element={user ? <NavToLeadSearch /> : <SignupPage />}
          />

          {!user && <Route path="*" element={<NavToLogin />} />}

          <Route index path="/" element={<LeadSearchPage />} />
          <Route path="/boards/v2" element={<AllBoardsPage />} />
          <Route path="/boards" element={<KanbanBoardPage />} />

          <Route path="/campaigns">
            <Route index element={<PastCampaignsPage />} />
            <Route path=":campaignId" element={<CampaignPage />} />
          </Route>

          <Route path="/demos">
            <Route path="campaign" element={<CampaignEmailDemoPage />} />
            <Route path="email" element={<TestEmailPage />} />
          </Route>

          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<NavTo404 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
