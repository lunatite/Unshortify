import { Inject } from "@nestjs/common";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import axios from "axios";
import * as cheerio from "cheerio";
import { MissingParameterError } from "src/common/errors";
import { LinkProcessorHandler } from "../link-processor.types";
import { BypassLinkNotFoundException } from "../exceptions/bypass-link-not-found.exception";
import { CacheService } from "./shared/cache/cache.service";

export class Sub2GetService
  extends CacheService
  implements LinkProcessorHandler
{
  public readonly name = "Sub2Get";

  constructor(@Inject(CACHE_MANAGER) cache: Cache) {
    super(cache);
  }

  private async fetchBypassedLink(url: URL): Promise<string> {
    const { data: htmlContent } = await axios.get(url.href, {
      responseType: "text",
    });

    const $ = cheerio.load(htmlContent);
    const bypassedLink = $("#updateHiddenUnlocks").attr("href");

    if (!bypassedLink) {
      throw new BypassLinkNotFoundException();
    }

    return bypassedLink;
  }

  async resolve(url: URL) {
    const linkId = url.searchParams.get("l");

    if (!linkId) {
      throw new MissingParameterError("l");
    }

    const cachedLink = await this.getFromCache<string>(linkId);

    if (cachedLink !== null) {
      return cachedLink;
    }

    const bypassedLink = await this.fetchBypassedLink(url);

    // The website appears to be down at the moment, and the URL cannot be edited once created.
    // Revisit this later.
    await this.storeInCache(linkId, bypassedLink);

    return bypassedLink;
  }
}
