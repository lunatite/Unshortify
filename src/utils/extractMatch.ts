export function extractMatch(text: string, regex: RegExp, fieldName: string) {
  const match = regex.exec(text);

  if (!match?.[1]) {
    throw new Error(`Could not find ${fieldName} in the text`);
  }

  return match[1];
}
