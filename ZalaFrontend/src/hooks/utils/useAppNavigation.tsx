import { useLocation, useNavigate } from "react-router";
import type { ILead } from "../../interfaces";

export const useAppNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const toLeadSearchPage = () => navigate("/");

  const toCampaignPage = (campaignId: number, leads: ILead[] = []) =>
    navigate("/campaigns/" + campaignId, { state: { leads } });

  const toBoardsPage = () => navigate("/boards");

  const toLoginPage = () => navigate("/login");

  const toSignupPage = () => navigate("/signup");

  const toNotFound = () => navigate("/404");

  const toEmailTestPage = () => navigate("/demos/email");

  const toCampaignEmailTestPage = () => navigate("/demos/campaign");

  const toSMTPTestPage = () => navigate("/demos/smtp");

  const toPastCampaigns = () => navigate("/campaigns");

  const toBoardsV2Page = () => navigate("/boards/v2");

  return {
    location,
    navigate,

    toLeadSearchPage,
    toBoardsPage,
    toCampaignPage,
    toLoginPage,
    toSignupPage,
    toNotFound,
    toEmailTestPage,
    toPastCampaigns,
    toCampaignEmailTestPage,
    toSMTPTestPage,
    toBoardsV2Page,
  };
};
