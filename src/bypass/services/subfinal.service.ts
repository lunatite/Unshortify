import { Inject, Injectable } from "@nestjs/common";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { BypassLinkNotFoundException } from "../exceptions/bypass-link-not-found.exception";
import { CacheService } from "./shared/cache/cache.service";
import { MS_IN_HOUR } from "src/common/constants";
import { HttpClient } from "src/http-client/http-client";

@Injectable()
export class SubFinalService
  extends CacheService
  implements LinkProcessorHandler
{
  public readonly name = "SubFinal";
  protected readonly ttl = MS_IN_HOUR;

  private readonly fileRegex = /window\.open\("(.*)","_self"\);/;

  constructor(
    @Inject(CACHE_MANAGER) cache: Cache,
    private readonly httpClient: HttpClient,
  ) {
    super(cache);
  }

  private async fetchBypassedLink(id: string) {
    const { data: htmlContent } = await this.httpClient.get<string>(
      `https://subfinal.com/final.php?$=${id}&own=owner`,
    );

    const fileRegexMatch = this.fileRegex.exec(htmlContent);

    if (!fileRegexMatch || fileRegexMatch[1] === undefined) {
      throw new BypassLinkNotFoundException();
    }

    const bypassedLink = fileRegexMatch[1];
    return bypassedLink;
  }

  async resolve(url: URL) {
    if (url.pathname === "/") {
      throw new InvalidPathException(
        "/SL/{id} or /S/FL.php?view={id} or /final.php?$={id}",
      );
    }

    let id = url.searchParams.get("view") || url.searchParams.get("$");

    if (!id) {
      const pathId = url.pathname.split("/SL/")[1];
      id = pathId || null;
    }

    if (!id) {
      throw new InvalidPathException(
        "/SL/{id} or /S/FL.php?view={id} or /final.php?$={id}",
      );
    }

    const cachedBypassedLink = await this.getFromCache<string>(id);

    if (cachedBypassedLink) {
      return cachedBypassedLink;
    }

    const bypassedLink = await this.fetchBypassedLink(id);
    await this.storeInCache(id, bypassedLink);

    return bypassedLink;
  }
}
