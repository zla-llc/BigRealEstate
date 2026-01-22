import { CONFIG } from "../../../config";

export const resolveAssetUrl = (path?: string | null) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const fallback = typeof window !== "undefined" ? window.location.origin : "";
  const base = CONFIG.api || fallback;
  try {
    return new URL(path, base).toString();
  } catch {
    const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
  }
};
