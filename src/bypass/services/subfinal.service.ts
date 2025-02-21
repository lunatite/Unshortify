import { BadRequestException, Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { BypassLinkNotFoundException } from "../exceptions/bypass-link-not-found.exception";

@Injectable()
export class SubFinalService implements LinkProcessorHandler {
  public readonly name = "SubFinal";

  private readonly windowOpenUrlRegex = /window\.open\("(.*)","_self"\);/;

  constructor(private readonly httpService: HttpService) {}

  private async fetchBypassedLink(id: string) {
    const { data: htmlContent } = await this.httpService.axiosRef.get<string>(
      `https://subfinal.com/final.php?$=${id}&own=owner`,
    );

    const fileRegexMatch = this.windowOpenUrlRegex.exec(htmlContent);

    if (!fileRegexMatch || fileRegexMatch[1] === undefined) {
      throw new BypassLinkNotFoundException();
    }

    const bypassedLink = fileRegexMatch[1];

    // if the bypassed link is empty it means that it doesn't exist.
    if (bypassedLink === "") {
      throw new BadRequestException("The requested resource cannot be found");
    }

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

    const bypassedLink = await this.fetchBypassedLink(id);
    return bypassedLink;
  }
}
