import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { BypassLinkNotFoundException } from "../exceptions/bypass-link-not-found.exception";
import { HttpClient } from "src/http-client/http-client";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AdFocusService implements LinkProcessorHandler {
  public readonly name = "Adfocus";
  private readonly clickUrlRegex = /var click_url\s*=\s*"([^"]+)"/;

  constructor(private readonly httpClient: HttpClient) {}

  private async fetchBypassedLink(url: URL) {
    const { data: htmlContent } = await this.httpClient.get<string>(url.href, {
      responseType: "text",
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const bypassedUrlMatch = this.clickUrlRegex.exec(htmlContent);

    if (!bypassedUrlMatch || !bypassedUrlMatch[1]) {
      throw new BypassLinkNotFoundException();
    }

    const bypassedUrl = bypassedUrlMatch[1];
    return bypassedUrl;
  }

  async resolve(url: URL): Promise<string> {
    if (url.pathname === "/") {
      throw new InvalidPathException("/${id}");
    }

    const bypassedLink = await this.fetchBypassedLink(url);
    return bypassedLink;
  }
}
