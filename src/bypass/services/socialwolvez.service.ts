import { Injectable } from "@nestjs/common";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";

@Injectable()
export class SocialWolvezService implements LinkProcessorHandler {
  public readonly name = "SocialWolvez";
  private readonly requiredPathSegments = 4;

  async resolve(url: URL) {
    if (
      url.pathname === "/" ||
      url.pathname.split("/").length < this.requiredPathSegments
    ) {
      throw new InvalidPathException("/app/l/{id}");
    }

    return "";
  }
}
