import { InternalServerErrorException } from "@nestjs/common";

export class BypassLinkNotFoundException extends InternalServerErrorException {
  constructor() {
    super("Failed to find the bypass link");
  }
}
