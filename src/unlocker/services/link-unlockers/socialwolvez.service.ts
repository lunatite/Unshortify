import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import * as cheerio from "cheerio";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { SupportedHosts } from "src/unlocker/decorators/supported-hosts.decorator";
import { UnlockerService, UnlockerResult } from "../unlocker.type";
import { UnlockedLinkNotFoundError } from "./errors/unlocked-link-not-found.error";

@Injectable()
@SupportedHosts(["socialwolvez.com"])
export class SocialWolvezService implements UnlockerService {
  public readonly name = "SocialWolvez";

  private static readonly REQUIRED_PATH_SEGMENTS = 4;
  private static readonly TARGET_NUXT_DATA_INDEX = 5;

  private static readonly NUXT_DATA_SCRIPT_TAG = "script[id='__NUXT_DATA__']";

  constructor(private readonly httpService: HttpService) {}

  private async fetchUnlockedLink(url: URL) {
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

    const unlockedLink = nuxtData[SocialWolvezService.TARGET_NUXT_DATA_INDEX];

    if (
      (typeof unlockedLink === "string" && unlockedLink === "") ||
      typeof unlockedLink === "object"
    ) {
      throw new UnlockedLinkNotFoundError(url);
    }

    return unlockedLink;
  }

  async unlock(url: URL): Promise<UnlockerResult> {
    if (
      url.pathname === "/" ||
      url.pathname.split("/").length <
        SocialWolvezService.REQUIRED_PATH_SEGMENTS
    ) {
      throw new InvalidPathException("/app/l/{id}");
    }

    const unlockedLink = await this.fetchUnlockedLink(url);
    return {
      type: "url",
      content: unlockedLink,
    };
  }
}
