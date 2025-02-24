export class PasteNotFoundError extends Error {
  constructor(url: URL) {
    super(`The paste at "${url.href}" could not be found.`);
    this.name = "PasteNotFoundError";
  }
}
