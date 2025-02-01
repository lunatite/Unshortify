import { RawAxiosRequestHeaders, RawAxiosResponseHeaders } from "axios";

export function extractCookiesFromHeaders(
  headers: RawAxiosRequestHeaders | RawAxiosResponseHeaders,
) {
  const cookies = headers["set-cookie"];

  if (!Array.isArray(cookies)) {
    throw new Error("Invalid or missing 'set-cookie' header");
  }

  return cookies.map((cookie) => cookie.split(";")[0]).join("; ");
}
