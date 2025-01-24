export function decodeBase64(data: string) {
  if (typeof data !== "string") {
    throw new Error("Data must be a string");
  }

  const decodedString = Buffer.from(data, "base64").toString("utf-8");
  return decodedString;
}
