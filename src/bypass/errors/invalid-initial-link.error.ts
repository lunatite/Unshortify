export class InvalidInitialLinkError extends Error {
  constructor(url: URL) {
    super(
      `The initial link "${url.href}" containing the shortened URL could not be found`,
    );
    this.name = "InvalidInitialLinkError";

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidInitialLinkError);
    }
  }
}
