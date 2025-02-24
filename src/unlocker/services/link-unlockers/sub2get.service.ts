import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import * as cheerio from "cheerio";
import { MissingParameterError } from "src/common/errors";
import { UnlockerResult, UnlockerService } from "../unlocker.type";
import { SupportedHosts } from "src/unlocker/decorators/supported-hosts.decorator";
import { InvalidInitialLinkError } from "src/unlocker/errors/invalid-initial-link.error";
import { UnlockedLinkNotFoundError } from "./errors/unlocked-link-not-found.error";

@Injectable()
@SupportedHosts(["www.sub2get.com", "sub2get.com"])
export class Sub2GetService implements UnlockerService {
  public readonly name = "Sub2Get";

  private static readonly UNLOCKED_LINK_SELECTOR = "#updateHiddenUnlocks";

  constructor(private readonly httpService: HttpService) {}

  private async fetchUnlockedLink(url: URL): Promise<string> {
    const { data: htmlContent } = await this.httpService.axiosRef.get<string>(
      url.href,
      {
        responseType: "text",
      },
    );

    const $ = cheerio.load(htmlContent);
    const unlockedLink = $(Sub2GetService.UNLOCKED_LINK_SELECTOR).attr("href");

    if (unlockedLink === undefined) {
      throw new UnlockedLinkNotFoundError(url);
    }

    if (unlockedLink === "") {
      throw new InvalidInitialLinkError(url);
    }

    return unlockedLink;
  }

  async unlock(url: URL): Promise<UnlockerResult> {
    const linkId = url.searchParams.get("l");

    if (!linkId) {
      throw new MissingParameterError("l");
    }

    const unlockedLink = await this.fetchUnlockedLink(url);

    return {
      type: "url",
      content: unlockedLink,
    };
  }
}
