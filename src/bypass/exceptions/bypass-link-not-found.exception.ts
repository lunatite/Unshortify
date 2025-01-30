import { InternalServerErrorException } from "@nestjs/common";

export class BypassLinkNotFoundException extends InternalServerErrorException {
  constructor() {
    super("Faled to find the bypass link on the page");
  }
}
