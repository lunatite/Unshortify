import { Injectable, Inject } from "@nestjs/common";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { CacheService } from "./shared/cache/cache.service";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { MS_IN_HOUR } from "src/common/constants";
import { HttpClient } from "src/http-client/http-client";
// import { HttpClientFactory } from "src/http-client/http-client.factory";

@Injectable()
export class RekoniseService
  extends CacheService
  implements LinkProcessorHandler
{
  public readonly name = "Rekonise";
  protected ttl = MS_IN_HOUR * 2;

  constructor(
    @Inject(CACHE_MANAGER) cache: Cache,
    private readonly httpClient: HttpClient,
  ) {
    super(cache);
  }

  private async fetchBypassedLink(id: string) {
    const { data } = await this.httpClient.get<{ url: string; date: string }>(
      `https://api.rekonise.com/social-unlocks/${id}`,
    );

    return data.url;
  }

  async resolve(url: URL) {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

    const id = url.pathname.slice(1, url.pathname.length);
    const cachedBypassedLink = await this.getFromCache<string>(id);

    if (cachedBypassedLink) {
      return cachedBypassedLink;
    }

    const bypassedLink = await this.fetchBypassedLink(id);

    await this.storeInCache(id, bypassedLink);
    return bypassedLink;
  }
}
