import { Injectable } from "@nestjs/common";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { BypassLinkNotFoundException } from "../exceptions/bypass-link-not-found.exception";
import { MS_IN_HOUR } from "src/common/constants";
import { HttpClient } from "src/http-client/http-client";

@Injectable()
export class MBoostMeService implements LinkProcessorHandler {
  public readonly name = "MBoost.me";
  protected ttl = MS_IN_HOUR * 2;
  private readonly targetUrlRegex = /"targeturl"\s*:\s*"([^"]+)"/;

  constructor(private readonly httpClient: HttpClient) {}

  private async fetchBypassedLink(url: URL) {
    const { data: htmlContent } = await this.httpClient.get<string>(url.href, {
      responseType: "text",
    });

    const bypassedLinkMatch = this.targetUrlRegex.exec(htmlContent);

    if (!bypassedLinkMatch || !bypassedLinkMatch[1]) {
      throw new BypassLinkNotFoundException();
    }

    return bypassedLinkMatch[1];
  }

  async resolve(url: URL): Promise<string> {
    const id = url.pathname.split("/a/")[1];

    if (!id) {
      throw new InvalidPathException("/a/{id}");
    }

    const bypassedLink = await this.fetchBypassedLink(url);
    return bypassedLink;
  }
}
