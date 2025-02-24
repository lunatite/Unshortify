export class InvalidInitialLinkError extends Error {
  constructor(url: URL) {
    super(
      `The initial link "${url.href}" containing the result could not be accessed or is invalid`,
    );
    this.name = "InvalidInitialLinkError";
  }
}
