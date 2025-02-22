import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import * as cheerio from "cheerio";
import { MissingParameterError } from "src/common/errors";
import { LinkProcessorHandler } from "../link-processor.types";
import { ShortenedLinkNotFoundError } from "../errors/shortened-link-not-found.error";
import { InvalidInitialLinkError } from "../errors/invalid-initial-link.error";
import { SupportedHosts } from "../decorators/supported-hosts.decorator";

@Injectable()
@SupportedHosts(["www.sub2get.com", "sub2get.com"])
export class Sub2GetService implements LinkProcessorHandler {
  public readonly name = "Sub2Get";

  private static readonly SHORTENED_LINK_SELECTOR = "#updateHiddenUnlocks";

  constructor(private readonly httpService: HttpService) {}

  private async fetchShortenedLink(url: URL): Promise<string> {
    const { data: htmlContent } = await this.httpService.axiosRef.get<string>(
      url.href,
      {
        responseType: "text",
      },
    );

    const $ = cheerio.load(htmlContent);
    const shortenedLink = $(Sub2GetService.SHORTENED_LINK_SELECTOR).attr(
      "href",
    );

    if (shortenedLink === undefined) {
      throw new ShortenedLinkNotFoundError(url);
    }

    if (shortenedLink === "") {
      throw new InvalidInitialLinkError(url);
    }

    return shortenedLink;
  }

  async resolve(url: URL) {
    const linkId = url.searchParams.get("l");

    if (!linkId) {
      throw new MissingParameterError("l");
    }

    const shortenedLink = await this.fetchShortenedLink(url);
    return shortenedLink;
  }
}
