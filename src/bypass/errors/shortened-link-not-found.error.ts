export class ShortenedLinkNotFoundError extends Error {
  constructor(url: URL) {
    super(
      `The shortened link for the original link "${url.href}" could not be found`,
    );
    this.name = "ShortenedLinkNotFoundError";
  }
}
