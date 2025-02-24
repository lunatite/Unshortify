import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { extractMatch } from "src/utils/extractMatch";
import { SupportedHosts } from "src/unlocker/decorators/supported-hosts.decorator";
import { UnlockerResult, UnlockerService } from "../unlocker.type";
import { UnlockedLinkNotFoundError } from "./errors/unlocked-link-not-found.error";

@Injectable()
@SupportedHosts(["mboost.me"])
export class MBoostMeService implements UnlockerService {
  public readonly name = "MBoost.me";
  private static readonly TARGET_URL_REGEX = /\\"targeturl\\":\\"(.*?)\\"/;

  constructor(private readonly httpService: HttpService) {}

  private async fetchUnlockedLink(url: URL) {
    const { data: htmlContent } = await this.httpService.axiosRef.get<string>(
      url.href,
      {
        responseType: "text",
      },
    );

    const unlockedLink = extractMatch(
      htmlContent,
      MBoostMeService.TARGET_URL_REGEX,
    );

    if (!unlockedLink) {
      throw new UnlockedLinkNotFoundError(url);
    }

    return unlockedLink;
  }

  async unlock(url: URL): Promise<UnlockerResult> {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

    if (url.pathname.split("/").length !== 2) {
      throw new InvalidPathException("/{id}");
    }

    const unlockedLink = await this.fetchUnlockedLink(url);

    return {
      type: "url",
      content: unlockedLink,
    };
  }
}
