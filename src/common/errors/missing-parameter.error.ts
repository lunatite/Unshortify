export class MissingParameterError extends Error {
  constructor(parameter: string) {
    super(`The '${parameter}' is missing or invalid in the URL`);
    this.name = "MissingParameterError";
  }
}
