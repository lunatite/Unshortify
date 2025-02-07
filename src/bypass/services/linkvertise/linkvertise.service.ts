import { LinkProcessorHandler } from "src/bypass/link-processor.types";

export class LinkvertiseService implements LinkProcessorHandler {
  public readonly name = "Linkvertise";

  async resolve(url: URL) {
    return "";
  }
}
