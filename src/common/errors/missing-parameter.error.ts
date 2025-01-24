export class MissingParameterError extends Error {
  constructor(parameter: string) {
    super(`${parameter} is missing or invalid`);
    this.name = "MissingParameterError";
    Error.captureStackTrace(this, MissingParameterError);
  }
}
