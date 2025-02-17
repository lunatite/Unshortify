import { fromBase64, toBase64 } from "./b64";

export function decodeJwt(token: string) {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid JWT token structure");
  }

  const header = JSON.parse(fromBase64(parts[0]));
  const payload = JSON.parse(fromBase64(parts[1])) as unknown;
  const signature = parts[2];

  return {
    header,
    payload,
    signature,
  };
}
