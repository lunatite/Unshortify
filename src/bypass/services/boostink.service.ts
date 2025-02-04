import { Inject } from "@nestjs/common";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import * as cheerio from "cheerio";
import { LinkProcessorHandler } from "../link-processor.types";
import { decodeBase64 } from "src/utils/decodeBase64";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { BypassLinkNotFoundException } from "../exceptions/bypass-link-not-found.exception";
import { CacheService } from "./shared/cache/cache.service";
import { MS_IN_HOUR } from "src/common/constants";
import { HttpClient } from "src/http-client/http-client";

export class BoostInkService
  extends CacheService
  implements LinkProcessorHandler
{
  private readonly scriptAttribName = "bufpsvdhmjybvgfncqfa";

  public readonly name = "Boost.Ink";
  protected ttl = MS_IN_HOUR * 2;

  constructor(
    @Inject(CACHE_MANAGER) cache: Cache,
    private readonly httpClient: HttpClient,
  ) {
    super(cache);
  }

  private async fetchBypassedLink(url: URL) {
    const { data: htmlContent } = await this.httpClient.get<string>(url.href, {
      responseType: "text",
    });

    const $ = cheerio.load(htmlContent);

    const encodedBypassedLink = $(`script[${this.scriptAttribName}]`).attr(
      this.scriptAttribName,
    );

    if (!encodedBypassedLink) {
      throw new BypassLinkNotFoundException();
    }

    const bypassedLink = decodeBase64(encodedBypassedLink);
    return bypassedLink;
  }

  async resolve(url: URL) {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

    const id = url.pathname.split("/")[1];
    const cachedBypassedLink = await this.getFromCache<string>(id);

    if (cachedBypassedLink) {
      return cachedBypassedLink;
    }

    const bypassedLink = await this.fetchBypassedLink(url);

    await this.storeInCache(id, bypassedLink);
    return bypassedLink;
  }
}
