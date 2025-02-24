export class UnlockedLinkNotFoundError extends Error {
  constructor(url: URL) {
    super(`The unlocked link at "${url.href}" could not be found`);
    this.name = "UnlockedLinkNotFoundError";
  }
}
