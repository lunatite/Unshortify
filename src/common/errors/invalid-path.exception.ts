import { BadRequestException } from "@nestjs/common";

export class InvalidPathException extends BadRequestException {
  constructor(path: string) {
    super(`The provided path '${path}' is missing or invalid`);
  }
}
