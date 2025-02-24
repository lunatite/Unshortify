import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { extractMatch } from "src/utils/extractMatch";
import { SupportedHosts } from "src/unlocker/decorators/supported-hosts.decorator";
import { UnlockerResult, UnlockerService } from "../unlocker.type";
import { UnlockedLinkNotFoundError } from "./errors/unlocked-link-not-found.error";

@Injectable()
@SupportedHosts(["subfinal.com"])
export class SubFinalService implements UnlockerService {
  public readonly name = "SubFinal";

  private static readonly WINDOW_OPEN_URL_REGEX =
    /window\.open\("(.*)","_self"\);/;

  constructor(private readonly httpService: HttpService) {}

  private async fetchShortenedLink(id: string) {
    const { data: htmlContent } = await this.httpService.axiosRef.get<string>(
      `https://subfinal.com/final.php?$=${id}&own=owner`,
    );

    const shortenedLink = extractMatch(
      htmlContent,
      SubFinalService.WINDOW_OPEN_URL_REGEX,
    );

    if (shortenedLink === undefined) {
      return null;
    }

    // if the bypassed link is empty it means that it doesn't exist.
    if (shortenedLink === "") {
      return null;
    }

    return shortenedLink;
  }

  async unlock(url: URL): Promise<UnlockerResult> {
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

    const unlockedLink = await this.fetchShortenedLink(id);

    if (!unlockedLink) {
      throw new UnlockedLinkNotFoundError(url);
    }

    return {
      type: "url",
      content: unlockedLink,
    };
  }
}
