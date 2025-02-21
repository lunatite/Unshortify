export class InvalidPathException extends Error {
  constructor(path: string) {
    super(`The provided path '${path}' is missing or invalid`);
  }
}
