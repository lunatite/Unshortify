import axios from "axios";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { BypassLinkNotFoundException } from "../exceptions/bypass-link-not-found.exception";

export class MBoostMeService implements LinkProcessorHandler {
  public readonly name = "MBoost.me";
  private readonly targetUrlRegex = /"targeturl"\s*:\s*"([^"]+)"/;

  async resolve(url: URL): Promise<string> {
    const pathId = url.pathname.split("/a/")[1];

    if (!pathId) {
      throw new InvalidPathException("/a/{id}");
    }

    const { data: htmlContent } = await axios.get(url.href, {
      responseType: "text",
    });

    const bypassedLinkMatch = this.targetUrlRegex.exec(htmlContent);

    if (!bypassedLinkMatch || !bypassedLinkMatch[1]) {
      throw new BypassLinkNotFoundException();
    }

    const bypassedLink = bypassedLinkMatch[1];
    return bypassedLink;
  }
}
