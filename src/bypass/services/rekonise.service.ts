import { Injectable } from "@nestjs/common";
import { LinkProcessorHandler } from "../link-processor.types";

@Injectable()
export class RekoniseService implements LinkProcessorHandler {
  public readonly name = "Rekonise";

  async resolve(url: URL) {
    return "test";
  }
}
