import { BadRequestException } from "@nestjs/common";

export class HostNotSupported extends BadRequestException {
  constructor(url: URL) {
    super(`The hostname '${url.hostname}' is not supported`);
  }
}
