export function extractMatch(text: string, regex: RegExp) {
  const match = regex.exec(text);
  return match && match[1] ? match[1] : null;
}
