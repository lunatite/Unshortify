import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { extractMatch } from "src/utils/extractMatch";
import { ShortenedLinkNotFoundError } from "../errors/shortened-link-not-found.error";

@Injectable()
export class SubFinalService implements LinkProcessorHandler {
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

    const shortenedLink = await this.fetchShortenedLink(id);

    if (!shortenedLink) {
      throw new ShortenedLinkNotFoundError(url);
    }

    return shortenedLink;
  }
}
