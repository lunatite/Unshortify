import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { extractMatch } from "src/utils/extractMatch";
import { ShortenedLinkNotFoundError } from "../errors/shortened-link-not-found.error";
import { SupportedHosts } from "../decorators/supported-hosts.decorator";

@Injectable()
@SupportedHosts(["mboost.me"])
export class MBoostMeService implements LinkProcessorHandler {
  public readonly name = "MBoost.me";
  private static readonly TARGET_URL_REGEX = /\\"targeturl\\":\\"(.*?)\\"/;

  constructor(private readonly httpService: HttpService) {}

  private async fetchShortenedLink(url: URL) {
    const { data: htmlContent } = await this.httpService.axiosRef.get<string>(
      url.href,
      {
        responseType: "text",
      },
    );

    const shortenedLink = extractMatch(
      htmlContent,
      MBoostMeService.TARGET_URL_REGEX,
    );

    if (!shortenedLink) {
      throw new ShortenedLinkNotFoundError(url);
    }

    return shortenedLink;
  }

  async resolve(url: URL): Promise<string> {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

    if (url.pathname.split("/").length !== 2) {
      throw new InvalidPathException("/{id}");
    }

    const bypassedLink = await this.fetchShortenedLink(url);
    return bypassedLink;
  }
}
