import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import * as cheerio from "cheerio";
import { toBase64 } from "src/utils/b64";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { SupportedHosts } from "src/unlocker/decorators/supported-hosts.decorator";
import {
  UnlockerResult,
  UnlockerService,
} from "src/unlocker/services/unlocker.type";
import { UnlockedLinkNotFoundError } from "./errors/unlocked-link-not-found.error";

@Injectable()
@SupportedHosts(["bst.gg", "bst.wtf", "boost.ink", "booo.st"])
export class BoostInkService implements UnlockerService {
  public readonly name = "Boost.Ink";
  private static readonly SCRIPT_ATTRIBUTE_NAME = "bufpsvdhmjybvgfncqfa";

  constructor(private readonly httpService: HttpService) {}

  private async fetchUnlockedLink(url: URL) {
    const { data: htmlContent } = await this.httpService.axiosRef.get<string>(
      url.href,
      {
        responseType: "text",
      },
    );

    const $ = cheerio.load(htmlContent);

    const encodedUnlockedLink = $(
      `script[${BoostInkService.SCRIPT_ATTRIBUTE_NAME}]`,
    ).attr(BoostInkService.SCRIPT_ATTRIBUTE_NAME);

    if (encodedUnlockedLink === undefined) {
      throw new Error(
        "Failed to extract encoded link. The expected script attribute may have changed or is missing",
      );
    }

    if (!encodedUnlockedLink) {
      throw new UnlockedLinkNotFoundError(url);
    }

    const unlockedLink = toBase64(encodedUnlockedLink);
    return unlockedLink;
  }

  async unlock(url: URL): Promise<UnlockerResult> {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

    const unlockedLink = await this.fetchUnlockedLink(url);

    return {
      type: "url",
      content: unlockedLink,
    };
  }
}
