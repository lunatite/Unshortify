import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import axios from "axios";
import * as cheerio from "cheerio";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { CacheService } from "./shared/cache/cache.service";

@Injectable()
export class SocialWolvezService
  extends CacheService
  implements LinkProcessorHandler
{
  public readonly name = "SocialWolvez";
  private readonly requiredPathSegments = 4;
  private readonly targetNuxtDataIndex = 5;

  constructor(@Inject(CACHE_MANAGER) cache: Cache) {
    super(cache);
  }

  private async fetchBypassLink(url: URL) {
    const { data: htmlContent } = await axios.get(url.href);
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

    const id = url.pathname.split("/")[this.requiredPathSegments - 1];
    const cachedBypassedLink = await this.getFromCache<string>(id);

    if (cachedBypassedLink) {
      return cachedBypassedLink;
    }

    const bypassedLink = await this.fetchBypassLink(url);
    await this.storeInCache(id, bypassedLink, 1000 * 60 * 60 * 24);

    return bypassedLink;
  }
}
