import axios from "axios";
import * as cheerio from "cheerio";
import { MissingParameterError } from "src/common/errors";
import { LinkProcessorHandler } from "../link-processor.types";
import { BypassLinkNotFoundException } from "../exceptions/bypass-link-not-found.exception";

export class Sub2GetService implements LinkProcessorHandler {
  public readonly name = "Sub2Get";

  async resolve(url: URL) {
    const linkId = url.searchParams.get("l");

    if (!linkId) {
      throw new MissingParameterError("l");
    }

    const { data: htmlContent } = await axios.get(url.href, {
      responseType: "text",
    });

    const $ = cheerio.load(htmlContent);
    const bypassedLink = $("#updateHiddenUnlocks").attr("href");

    if (bypassedLink === undefined) {
      throw new BypassLinkNotFoundException();
    }

    return bypassedLink;
  }
}
