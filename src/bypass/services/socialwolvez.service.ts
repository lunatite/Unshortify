import { Injectable } from "@nestjs/common";
import { LinkProcessorHandler } from "../link-processor.types";

@Injectable()
export class SocialWolvezService implements LinkProcessorHandler {
  public readonly name = "SocialWolvez";

  async resolve(url: URL) {
    return "";
  }
}
