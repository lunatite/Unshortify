import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import * as cheerio from "cheerio";
import { LinkProcessorHandler } from "../link-processor.types";
import { toBase64 } from "src/utils/b64";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { BypassLinkNotFoundException } from "../errors/bypass-link-not-found.exception";

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

    if (encodedBypassedLink === undefined) {
      throw new Error(
        "Failed to extract encoded link. The expect script attribute might have changed or is missing.",
      );
    }

    if (!encodedBypassedLink) {
      throw new BypassLinkNotFoundException();
    }

    const bypassedLink = toBase64(encodedBypassedLink);
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
