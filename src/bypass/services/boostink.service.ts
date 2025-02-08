import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import * as cheerio from "cheerio";
import { LinkProcessorHandler } from "../link-processor.types";
import { decodeBase64 } from "src/utils/decodeBase64";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { BypassLinkNotFoundException } from "../exceptions/bypass-link-not-found.exception";

@Injectable()
export class BoostInkService implements LinkProcessorHandler {
  private readonly scriptAttribName = "bufpsvdhmjybvgfncqfa";
  public readonly name = "Boost.Ink";

  constructor(private readonly httpService: HttpService) {}

  private async fetchBypassedLink(url: URL) {
    const { data: htmlContent } = await this.httpService.axiosRef.get<string>(
      url.href,
      {
        responseType: "text",
      },
    );

    const $ = cheerio.load(htmlContent);

    const encodedBypassedLink = $(`script[${this.scriptAttribName}]`).attr(
      this.scriptAttribName,
    );

    if (!encodedBypassedLink) {
      throw new BypassLinkNotFoundException();
    }

    const bypassedLink = decodeBase64(encodedBypassedLink);
    return bypassedLink;
  }

  async resolve(url: URL) {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

    const bypassedLink = await this.fetchBypassedLink(url);
    return bypassedLink;
  }
}
