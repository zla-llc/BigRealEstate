import { CONFIG } from "../../config";
import type { APIResponse } from "./types";

const OK_STATUS_CODES = [200, 201, 204];

export const useFetch = () => {
  const defaultHeaders = {
    Accept: "application/json",
  } as Record<string, string>;

  const requestSuccess = <T,>(json: unknown): APIResponse<T> => ({
    data: json as T,
    err: null,
  });

  const requestError = <T,>(err: unknown): APIResponse<T> => ({
    data: null,
    err:
      typeof err === "string"
        ? err
        : err instanceof Error
        ? err.message
        : "Get request failed",
  });

  const fetchWithParams = async <T,>(
    apiEndpoint: string,
    method: "POST" | "GET" | "PUT" | "DELETE",
    body: unknown,
    isFormData: boolean = false,
    abortController = new AbortController()
  ): Promise<APIResponse<T>> => {
    const url = CONFIG.api + apiEndpoint;

    try {
      const headers: Record<string, string> = { ...defaultHeaders };
      let bodyToSend: BodyInit | null = null;

      if (method !== "GET" && method !== "DELETE" && body != null) {
        if (isFormData) {
          if (body instanceof FormData) {
            bodyToSend = body;
          } else {
            throw new Error("Form data body must be an instance of FormData");
          }
        } else {
          headers["Content-Type"] = "application/json";
          bodyToSend = JSON.stringify(body);
        }
      }

      const response = await fetch(url, {
        method,
        body: bodyToSend,
        headers,
        signal: abortController.signal,
      });
      const raw = await response.text();
      let json: any = null;
      if (raw) {
        try {
          json = JSON.parse(raw);
        } catch {
          // leave json as null and treat as error below if status not ok
          json = null;
        }
      }

      if (!OK_STATUS_CODES.includes(response.status) || json?.err || json?.error)
        throw new Error(
          json?.err ?? json?.error ?? "Error communicating with API"
        );

      return requestSuccess<T>(json);
    } catch (err) {
      return requestError<T>(err);
    }
  };

  const get = async <T,>(
    apiEndpoint: string,
    abortController = new AbortController()
  ): Promise<APIResponse<T>> => {
    return await fetchWithParams(
      apiEndpoint,
      "GET",
      null,
      false,
      abortController
    );
  };

  const post = async <T,>(
    apiEndpoint: string,
    body: unknown,
    isFormData: boolean = false,
    abortController = new AbortController()
  ): Promise<APIResponse<T>> => {
    return await fetchWithParams(
      apiEndpoint,
      "POST",
      body,
      isFormData,
      abortController
    );
  };

  const put = async <T,>(
    apiEndpoint: string,
    body: unknown,
    isFormData: boolean = false,
    abortController = new AbortController()
  ): Promise<APIResponse<T>> => {
    return await fetchWithParams(
      apiEndpoint,
      "PUT",
      body,
      isFormData,
      abortController
    );
  };

  const del = async <T,>(
    apiEndpoint: string,
    abortController = new AbortController()
  ): Promise<APIResponse<T>> => {
    return await fetchWithParams(
      apiEndpoint,
      "DELETE",
      null,
      false,
      abortController
    );
  };

  return { get, post, put, del };
};
