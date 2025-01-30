import axios from "axios";
import * as cheerio from "cheerio";
import { LinkProcessorHandler } from "../link-processor.types";
import { decodeBase64 } from "src/utils/decodeBase64";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { BypassLinkNotFoundException } from "../exceptions/bypass-link-not-found.exception";

export class BoostInkService implements LinkProcessorHandler {
  private readonly scriptAttribName = "bufpsvdhmjybvgfncqfa";
  public readonly name = "Boost.Ink";

  async resolve(url: URL) {
    const path = url.pathname;

    if (path === "/") {
      throw new InvalidPathException("/{id}");
    }

    const { data: htmlContent } = await axios.get(url.href, {
      responseType: "text",
    });

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
