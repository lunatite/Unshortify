import axios from "axios";
import { Inject } from "@nestjs/common";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { BypassLinkNotFoundException } from "../exceptions/bypass-link-not-found.exception";
import { CacheService } from "./shared/cache/cache.service";

export class MBoostMeService
  extends CacheService
  implements LinkProcessorHandler
{
  public readonly name = "MBoost.me";
  private readonly targetUrlRegex = /"targeturl"\s*:\s*"([^"]+)"/;

  constructor(@Inject(CACHE_MANAGER) cache: Cache) {
    super(cache);
  }

  private async fetchBypassedLink(url: URL) {
    const { data: htmlContent } = await axios.get(url.href, {
      responseType: "text",
    });

    const bypassedLinkMatch = this.targetUrlRegex.exec(htmlContent);

    if (!bypassedLinkMatch || !bypassedLinkMatch[1]) {
      throw new BypassLinkNotFoundException();
    }

    return bypassedLinkMatch[1];
  }

  async resolve(url: URL): Promise<string> {
    const id = url.pathname.split("/a/")[1];

    if (!id) {
      throw new InvalidPathException("/a/{id}");
    }

    const cachedBypassedLink = await this.getFromCache<string>(id);

    if (cachedBypassedLink) {
      return cachedBypassedLink;
    }

    const bypassedLink = await this.fetchBypassedLink(url);

    await this.storeInCache(id, bypassedLink, 1000 * 60 * 60 * 24);

    return bypassedLink;
  }
}
