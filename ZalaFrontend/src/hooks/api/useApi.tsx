import {
  CampaignContactMethod,
  type ACampaign,
  type ACampaignLead,
  type AUser,
  type ACampaignEmail,
  type ACampaignEmailSendResponse,
  type ACampaignSummary,
} from "../../interfaces";
import type {
  CreateUserProps,
  LinkContactToUserProps,
  LoginAPIProps,
  LoginGoogleProps,
  SendTestEmailProps,
  CreateCampaignEmailDraftProps,
  SendCampaignEmailProps as SendCampaignEmailPayload,
  CampaignEmailQueryParams,
  UpdateCampaignEmailDraftProps,
  DeleteCampaignEmailDraftProps,
  ListCampaignsParams,
  CreateCampaignProps,
  UpdateCampaignLeadProps,
} from "./types";
import { useFetch } from "./useFetch";
import { useState } from "react";
import { useApiResponseError } from "../utils";
import { useBoardsApi } from "./useBoardsApi";
import { useLeadsApi } from "./useLeadsApi";
import { usePropertyApi } from "./usePropertyApi";

export const useApi = () => {
  const apiResponseError = useApiResponseError();
  const { post, get, put, del } = useFetch();
  const [signal, setSignalState] = useState<AbortSignal>(
    new AbortController().signal
  );
  const [signalTo, setSignalTo] = useState<string[]>([]);

  const setSignal = (signal: AbortSignal, attatchTo: string[]) => {
    setSignalState(signal);
    setSignalTo(attatchTo);
  };

  const getSignal = (from: string) => {
    if (!signalTo.includes(from)) return new AbortController().signal;
    return signal;
  };

  const idsToQueryString = (
    ids: (string | number)[],
    prefix: string = "id"
  ) => {
    let string = "";
    for (let i = 0; i < ids.length; i++) {
      if (i === 0) string += `${prefix}=${ids[i]}`;
      else string += `&${prefix}=${ids[i]}`;
    }
    return string;
  };

  const apiProps = { signal, getSignal, idsToQueryString };

  const boardsApiRoutes = useBoardsApi(apiProps);
  const leadsContactsAddressApi = useLeadsApi(apiProps);
  const propertyApiRoutes = usePropertyApi(apiProps);

  const createUser = async (body: CreateUserProps) => {
    return await post<AUser>(`/api/users/`, body, {
      isFormData: false,
      signal: getSignal("createUser"),
    });
  };

  const createCampaign = async ({
    title,
    leads,
    userId,
  }: CreateCampaignProps) => {
    return await post<ACampaign>(
      `/api/campaigns/`,
      {
        campaign_name: title,
        user_id: userId,
        lead_ids: leads,
      },
      { isFormData: false, signal: getSignal("createCampaign") }
    );
  };

  const linkContactToUser = async (body: LinkContactToUserProps) => {
    return await post<AUser>(
      `/api/users/${body.userId}/contacts/${body.contactId}`,
      {},
      { isFormData: false, signal: getSignal("linkContactToUser") }
    );
  };

  const updateCampaign = async ({
    title,
    leads,
    userId,
    campaignId,
  }: CreateCampaignProps & { campaignId: number }) => {
    return await put<ACampaign>(
      `/api/campaigns/${campaignId}`,
      {
        campaign_name: title,
        user_id: userId,
        lead_ids: leads,
      },
      { isFormData: false, signal: getSignal("updateCampaign") }
    );
  };

  const updateCampaignLead = async ({
    campaignId,
    leadId,
    userId: _userId,
    contactMethods,
  }: UpdateCampaignLeadProps) => {
    return await put<ACampaignLead>(
      `/api/campaign-leads/${campaignId}/leads/${leadId}`,
      {
        phone_contacted: contactMethods.includes(CampaignContactMethod.Phone),
        sms_contacted: contactMethods.includes(CampaignContactMethod.SMS),
        email_contacted: contactMethods.includes(CampaignContactMethod.Email),
      }
    );
  };

  const getUser = async (userId: string) => {
    return await get<AUser>(`/api/users/${userId}`, getSignal("getUser"));
  };

  const getCampaign = async (
    campaignId: number | string,
    _userId: number | string
  ) => {
    return await get<ACampaign>(
      `/api/campaigns/${campaignId}`,
      getSignal("getCampaign")
    );
  };

  const getCampaigns = async (campaignIds: number[] = []) => {
    return await get<ACampaign[]>(
      `/api/campaigns${
        campaignIds.length > 0
          ? `?${idsToQueryString(campaignIds, "campaign_id")}`
          : ""
      }`
    );
  };

  const loginGoogle = async ({
    code,
    scope,
    targetUserId,
  }: LoginGoogleProps) => {
    const payload: Record<string, unknown> = { code, scope };
    if (typeof targetUserId === "number") {
      payload.target_user_id = targetUserId;
    }
    return await post<AUser>(`/api/login/google`, payload, {
      isFormData: false,
      signal: getSignal("loginGoogle"),
    });
  };

  const loginAPI = async (body: LoginAPIProps) => {
    return await post<AUser>(`/api/login`, body, {
      isFormData: false,
      signal: getSignal("loginAPI"),
    });
  };

  const sendTestEmail = async ({
    userId,
    to,
    subject,
    html,
    fromName,
  }: SendTestEmailProps) => {
    type GmailResponse = { id: string; thread_id?: string };
    return await post<GmailResponse>(
      `/api/google-mail/send`,
      {
        user_id: userId,
        to,
        subject,
        html,
        from_name: fromName,
      },
      { isFormData: false, signal: getSignal("sendTestEmail") }
    );
  };

  const listCampaignEmails = async ({
    campaignId,
    skip,
    limit,
  }: CampaignEmailQueryParams = {}) => {
    const params = new URLSearchParams();
    if (typeof campaignId === "number") {
      params.append("campaign_id", String(campaignId));
    }
    if (typeof skip === "number") {
      params.append("skip", String(skip));
    }
    if (typeof limit === "number") {
      params.append("limit", String(limit));
    }
    const query = params.toString();
    const path = "/api/campaign-emails" + (query.length > 0 ? `?${query}` : "");
    return await get<ACampaignEmail[]>(path, getSignal("listCampaignEmails"));
  };

  const createCampaignEmailDraft = async ({
    campaignId,
    leadId,
    subject,
    body,
    fromName,
  }: CreateCampaignEmailDraftProps) => {
    return await post<ACampaignEmail>(`/api/campaign-emails/`, {
      campaign_id: campaignId,
      lead_id: leadId,
      message_subject: subject,
      message_body: body,
      from_name: fromName,
    });
  };

  const sendCampaignEmail = async ({
    campaignId,
    leadIds,
    subject,
    body,
    fromName,
  }: SendCampaignEmailPayload) => {
    return await post<ACampaignEmailSendResponse>(`/api/campaign-emails/send`, {
      campaign_id: campaignId,
      lead_id: leadIds,
      message_subject: subject,
      message_body: body,
      from_name: fromName,
    });
  };

  const updateCampaignEmailDraft = async ({
    messageId,
    subject,
    body,
    fromName,
    leadId,
  }: UpdateCampaignEmailDraftProps) => {
    const payload: Record<string, unknown> = {};
    if (typeof subject === "string") payload.message_subject = subject;
    if (typeof body === "string") payload.message_body = body;
    if (typeof fromName === "string") payload.from_name = fromName;
    if (typeof leadId === "number") payload.lead_id = leadId;
    else if (leadId === null) payload.lead_id = null;
    return await put<ACampaignEmail>(
      `/api/campaign-emails/${messageId}`,
      payload
    );
  };

  const deleteCampaignEmailDraft = async ({
    messageId,
  }: DeleteCampaignEmailDraftProps) => {
    return await del<void>(`/api/campaign-emails/${messageId}`);
  };

  const listCampaigns = async ({ skip, limit }: ListCampaignsParams = {}) => {
    const params = new URLSearchParams();
    if (typeof skip === "number") params.append("skip", String(skip));
    if (typeof limit === "number") params.append("limit", String(limit));
    const query = params.toString();
    return await get<ACampaignSummary[]>(
      `/api/campaigns${query ? `?${query}` : ""}`
    );
  };

  const intakeCsv = async ({ file }: { file: File }) => {
    const formData = new FormData();
    formData.append("file", file);
    return await post<{
      leads_created: number[];
      leads_updated: number[];
      leads_unchanged: number[];
    }>(
      `/api/import-csv/`,
      formData,
      { isFormData: true, signal: getSignal("intakeCsv") }
    );
  }

  return {
    ...boardsApiRoutes,
    ...leadsContactsAddressApi,
    ...propertyApiRoutes,
    apiResponseError,
    createUser,
    linkContactToUser,
    loginAPI,
    getUser,
    getCampaign,
    getCampaigns,
    loginGoogle,
    sendTestEmail,
    listCampaignEmails,
    createCampaignEmailDraft,
    sendCampaignEmail,
    updateCampaignEmailDraft,
    deleteCampaignEmailDraft,
    listCampaigns,
    createCampaign,
    updateCampaign,
    setSignal,
    updateCampaignLead,
    intakeCsv,
  };
};
