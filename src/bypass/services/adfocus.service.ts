import { Inject } from "@nestjs/common";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import axios from "axios";
import { CacheService } from "./shared/cache/cache.service";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { BypassLinkNotFoundException } from "../exceptions/bypass-link-not-found.exception";

export class AdFocusService
  extends CacheService
  implements LinkProcessorHandler
{
  public readonly name = "Adfocus";
  private readonly clickUrlRegex = /var click_url\s*=\s*"([^"]+)"/;
  private readonly twoHoursToMilliseconds = 2 * 60 * 60 * 1000;

  constructor(@Inject(CACHE_MANAGER) cache: Cache) {
    super(cache);
  }

  private async fetchBypassedLink(url: URL) {
    const { data: htmlContent } = await axios.get(url.href, {
      responseType: "text",
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const bypassedUrlMatch = this.clickUrlRegex.exec(htmlContent);

    if (!bypassedUrlMatch || !bypassedUrlMatch[1]) {
      throw new BypassLinkNotFoundException();
    }

    const bypassedUrl = bypassedUrlMatch[1];
    return bypassedUrl;
  }

  async resolve(url: URL): Promise<string> {
    if (url.pathname === "/") {
      throw new InvalidPathException("/${id}");
    }

    const id = url.pathname.split("/")[1];
    const cachedBypassedLink = await this.getFromCache<string>(id);

    if (cachedBypassedLink) {
      return cachedBypassedLink;
    }

    const bypassedLink = await this.fetchBypassedLink(url);
    await this.storeInCache(id, bypassedLink, this.twoHoursToMilliseconds);

    return bypassedLink;
  }
}
