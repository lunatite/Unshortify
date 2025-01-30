import axios from "axios";
import { BypassLinkService } from "../bypass.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { InternalServerErrorException } from "@nestjs/common";
import { BypassLinkNotFoundException } from "../exceptions/bypass-link-not-found.exception";

export class AdFocusService implements BypassLinkService {
  public readonly name = "Adfoc.us";
  private readonly clickUrlRegex = /var click_url\s*=\s*"([^"]+)"/;

  async resolve(url: URL): Promise<string> {
    if (url.pathname === "/") {
      throw new InvalidPathException("/${id}");
    }

    let htmlContent: string;

    try {
      const response = await axios.get(url.href, {
        responseType: "text",
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });

      htmlContent = response.data;
    } catch (error) {
      throw new InternalServerErrorException("Failed to fetch data from URL");
    }

    const bypassedUrlMatch = this.clickUrlRegex.exec(htmlContent);

    if (!bypassedUrlMatch || bypassedUrlMatch[1]) {
      throw new BypassLinkNotFoundException();
    }

    const bypassedUrl = bypassedUrlMatch[1];
    return bypassedUrl;
  }
}
