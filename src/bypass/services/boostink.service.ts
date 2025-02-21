import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import * as cheerio from "cheerio";
import { LinkProcessorHandler } from "../link-processor.types";
import { toBase64 } from "src/utils/b64";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { ShortenedLinkNotFoundError } from "../errors/shortened-link-not-found.error";

@Injectable()
export class BoostInkService implements LinkProcessorHandler {
  private readonly scriptAttribName = "bufpsvdhmjybvgfncqfa";
  public readonly name = "Boost.Ink";

  constructor(private readonly httpService: HttpService) {}

  private async fetchShortenedLink(url: URL) {
    const { data: htmlContent } = await this.httpService.axiosRef.get<string>(
      url.href,
      {
        responseType: "text",
      },
    );

    const $ = cheerio.load(htmlContent);

    const encodedShortenedLink = $(`script[${this.scriptAttribName}]`).attr(
      this.scriptAttribName,
    );

    if (encodedShortenedLink === undefined) {
      throw new Error(
        "Failed to extract encoded link. The expected script attribute might have changed or is missing.",
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
