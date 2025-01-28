import { BadRequestException } from "@nestjs/common";

export class MissingParameterError extends BadRequestException {
  constructor(parameter: string) {
    super(`The '${parameter}' is missing or invalid in the URL`);
  }
}
