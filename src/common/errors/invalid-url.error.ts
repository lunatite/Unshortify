export class InvalidUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidUrlError";
    Error.captureStackTrace(this, InvalidUrlError);
  }
}
