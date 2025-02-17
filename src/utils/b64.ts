export function toBase64(input: string | object) {
  let data: string;

  if (typeof input === "object") {
    data = JSON.stringify(input);
  } else if (typeof input === "string") {
    data = input;
  } else {
    throw new Error("Input must be a string or an object");
  }

  return Buffer.from(data, "utf-8").toString("base64");
}

export function fromBase64(input: string) {
  if (typeof input !== "string") {
    throw new Error("Input must be a Base64-encoded string");
  }

  const decodedData = Buffer.from(input, "base64").toString("utf-8");
  return decodedData;
}
