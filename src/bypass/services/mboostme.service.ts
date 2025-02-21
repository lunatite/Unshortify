import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { BypassLinkNotFoundException } from "../errors/bypass-link-not-found.exception";

@Injectable()
export class MBoostMeService implements LinkProcessorHandler {
  public readonly name = "MBoost.me";
  private readonly targetUrlRegex = /"targeturl"\s*:\s*"([^"]+)"/;

  constructor(private readonly httpService: HttpService) {}

  private async fetchBypassedLink(url: URL) {
    const { data: htmlContent } = await this.httpService.axiosRef.get<string>(
      url.href,
      {
        responseType: "text",
      },
    );

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
