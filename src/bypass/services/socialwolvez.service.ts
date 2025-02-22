import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import * as cheerio from "cheerio";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { ShortenedLinkNotFoundError } from "../errors/shortened-link-not-found.error";

@Injectable()
export class SocialWolvezService implements LinkProcessorHandler {
  public readonly name = "SocialWolvez";

  private static readonly REQUIRED_PATH_SEGMENTS = 4;
  private static readonly TARGET_NUXT_DATA_INDEX = 5;

  private static readonly NUXT_DATA_SCRIPT_TAG = "script[id='__NUXT_DATA__']";

  constructor(private readonly httpService: HttpService) {}

  private async fetchShortenedLink(url: URL) {
    const { data: htmlContent } = await this.httpService.axiosRef.get<string>(
      url.href,
    );
    const $ = cheerio.load(htmlContent);

    const rawNuxtData = $(SocialWolvezService.NUXT_DATA_SCRIPT_TAG).html();

    if (!rawNuxtData) {
      throw new Error(
        "Failed to extract Nuxt data. The expected script may have changed or is missing from the HTML",
      );
    }

    let nuxtData;
    try {
      nuxtData = JSON.parse(rawNuxtData);
    } catch (error) {
      throw new Error("Failed to parse the Nuxt data JSON");
    }

    const shortenedLink = nuxtData[SocialWolvezService.TARGET_NUXT_DATA_INDEX];

    if (
      (typeof shortenedLink === "string" && shortenedLink === "") ||
      typeof shortenedLink === "object"
    ) {
      throw new ShortenedLinkNotFoundError(url);
    }

    return shortenedLink;
  }

  async resolve(url: URL) {
    if (
      url.pathname === "/" ||
      url.pathname.split("/").length <
        SocialWolvezService.REQUIRED_PATH_SEGMENTS
    ) {
      throw new InvalidPathException("/app/l/{id}");
    }

    const shortenedLink = await this.fetchShortenedLink(url);
    return shortenedLink;
  }
}
