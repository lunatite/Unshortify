import axios from "axios";
import { InternalServerErrorException } from "@nestjs/common";
import { BypassLinkService } from "../bypass.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { BypassLinkNotFoundException } from "../exceptions/bypass-link-not-found.exception";

export class MBoostMeService implements BypassLinkService {
  public readonly name = "MBoost.me";
  private readonly targetUrlRegex = /"targeturl"\s*:\s*"([^"]+)"/;

  async bypass(url: URL): Promise<string> {
    const pathId = url.pathname.split("/a/")[1];

    if (!pathId) {
      throw new InvalidPathException("/a/{id}");
    }

    let htmlContent: string;

    try {
      const response = await axios.get(url.href, { responseType: "text" });

      htmlContent = response.data;
    } catch (error) {
      throw new InternalServerErrorException(`Failed to fetch data from URL`);
    }

    const bypassedLinkMatch = this.targetUrlRegex.exec(htmlContent);

    if (!bypassedLinkMatch || !bypassedLinkMatch[1]) {
      throw new BypassLinkNotFoundException();
    }

    const bypassedLink = bypassedLinkMatch[1];
    return bypassedLink;
  }
}
