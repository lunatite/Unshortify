import { Inject } from "@nestjs/common";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { CacheService } from "./shared/cache/cache.service";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { BypassLinkNotFoundException } from "../exceptions/bypass-link-not-found.exception";
import { MS_IN_HOUR } from "src/common/constants";
import { HttpClient } from "src/http-client/http-client";

export class AdFocusService
  extends CacheService
  implements LinkProcessorHandler
{
  public readonly name = "Adfocus";
  protected ttl = MS_IN_HOUR * 2;
  private readonly clickUrlRegex = /var click_url\s*=\s*"([^"]+)"/;

  constructor(
    @Inject(CACHE_MANAGER) cache: Cache,
    private readonly httpClient: HttpClient,
  ) {
    super(cache);
  }

  private async fetchBypassedLink(url: URL) {
    const { data: htmlContent } = await this.httpClient.get<string>(url.href, {
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
    await this.storeInCache(id, bypassedLink);

    return bypassedLink;
  }
}
