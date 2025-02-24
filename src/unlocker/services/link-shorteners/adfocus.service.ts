import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { extractMatch } from "src/utils/extractMatch";
import { InvalidInitialLinkError } from "../../errors/invalid-initial-link.error";
import { ShortenedLinkNotFoundError } from "./errors/shortened-link-not-found.error";
import { SupportedHosts } from "src/unlocker/decorators/supported-hosts.decorator";
import { UnlockerResult, UnlockerService } from "../unlocker.type";

@Injectable()
@SupportedHosts(["adfoc.us"])
export class AdFocusService implements UnlockerService {
  public readonly name = "Adfocus";
  private static readonly CLICK_URL_REGEX = /var click_url\s*=\s*"([^"]+)"/;
  private static readonly BASE_URL = "https://adfoc.us/";

  constructor(private readonly httpService: HttpService) {}

  private async fetchShortenedLink(url: URL) {
    const response = await this.httpService.axiosRef.get<string>(url.href, {
      responseType: "text",
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (response.request.res?.responseUrl === AdFocusService.BASE_URL) {
      throw new InvalidInitialLinkError(url);
    }

    const shortenedLink = extractMatch(
      response.data,
      AdFocusService.CLICK_URL_REGEX,
    );

    if (shortenedLink === null) {
      throw new ShortenedLinkNotFoundError(url);
    }

    return shortenedLink;
  }

  async unlock(url: URL): Promise<UnlockerResult> {
    if (url.pathname === "/") {
      throw new InvalidPathException("/${id}");
    }

    const shortenedLink = await this.fetchShortenedLink(url);

    return {
      type: "url",
      content: shortenedLink,
    };
  }
}
