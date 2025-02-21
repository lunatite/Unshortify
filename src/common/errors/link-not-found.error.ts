export class LinkNotFoundError extends Error {
  constructor(url: URL) {
    super(`The link "${url.href}" does not exist or cannot be resolved`);
    this.name = "LinkNotFoundError";
  }
}
