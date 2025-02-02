export function toUnixTimestamp(dateString: string) {
  return Math.floor(new Date(dateString).getTime() / 1000);
}
