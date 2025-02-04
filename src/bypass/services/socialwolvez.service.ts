import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import * as cheerio from "cheerio";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { HttpClient } from "src/http-client/http-client";

@Injectable()
export class SocialWolvezService implements LinkProcessorHandler {
  public readonly name = "SocialWolvez";
  private readonly requiredPathSegments = 4;
  private readonly targetNuxtDataIndex = 5;

  constructor(private readonly httpClient: HttpClient) {}

  private async fetchBypassLink(url: URL) {
    const { data: htmlContent } = await this.httpClient.get<string>(url.href);
    const $ = cheerio.load(htmlContent);

    const nuxtData = $("script[id='__NUXT_DATA__']").html();

    if (!nuxtData) {
      throw new BadRequestException("Nuxt data not found in the page");
    }

    let jsonNuxtData;
    try {
      jsonNuxtData = JSON.parse(nuxtData);
    } catch (error) {
      throw new InternalServerErrorException(
        "Failed to parse the Nuxt data. The data format may be incorrect.",
      );
    }

    return jsonNuxtData[this.targetNuxtDataIndex];
  }

  async resolve(url: URL) {
    if (
      url.pathname === "/" ||
      url.pathname.split("/").length < this.requiredPathSegments
    ) {
      throw new InvalidPathException("/app/l/{id}");
    }

    const bypassedLink = await this.fetchBypassLink(url);
    return bypassedLink;
  }
}
