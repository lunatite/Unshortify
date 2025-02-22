import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import * as cheerio from "cheerio";
import { LinkProcessorHandler } from "../link-processor.types";
import { toBase64 } from "src/utils/b64";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { ShortenedLinkNotFoundError } from "../errors/shortened-link-not-found.error";

@Injectable()
export class BoostInkService implements LinkProcessorHandler {
  public readonly name = "Boost.Ink";
  private static readonly SCRIPT_ATTRIBUTE_NAME = "bufpsvdhmjybvgfncqfa";

  constructor(private readonly httpService: HttpService) {}

  private async fetchShortenedLink(url: URL) {
    const { data: htmlContent } = await this.httpService.axiosRef.get<string>(
      url.href,
      {
        responseType: "text",
      },
    );

    const $ = cheerio.load(htmlContent);

    const encodedShortenedLink = $(
      `script[${BoostInkService.SCRIPT_ATTRIBUTE_NAME}]`,
    ).attr(BoostInkService.SCRIPT_ATTRIBUTE_NAME);

    if (encodedShortenedLink === undefined) {
      throw new Error(
        "Failed to extract encoded link. The expected script attribute may have changed or is missing",
      );
    }

    if (!encodedShortenedLink) {
      throw new ShortenedLinkNotFoundError(url);
    }

    const decodedShortenedLink = toBase64(encodedShortenedLink);
    return decodedShortenedLink;
  }

  async resolve(url: URL) {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

    const shortenedLink = await this.fetchShortenedLink(url);
    return shortenedLink;
  }
}
