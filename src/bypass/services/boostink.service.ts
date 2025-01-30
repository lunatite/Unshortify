import axios from "axios";
import * as cheerio from "cheerio";
import { InternalServerErrorException } from "@nestjs/common";
import { LinkShortenerService } from "../bypass.types";
import { decodeBase64 } from "src/utils/decodeBase64";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { BypassLinkNotFoundException } from "../exceptions/bypass-link-not-found.exception";

export class BoostInkService implements LinkShortenerService {
  private readonly scriptAttribName = "bufpsvdhmjybvgfncqfa";
  public readonly name = "Boost.Ink";

  async bypass(url: URL) {
    const path = url.pathname;

    if (path === "/") {
      throw new InvalidPathException("/{id}");
    }

    let htmlContent: string;

    try {
      const response = await axios.get(url.href, { responseType: "text" });
      htmlContent = response.data;
    } catch (error) {
      throw new InternalServerErrorException("Failed to fetch data from URL");
    }

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
}
