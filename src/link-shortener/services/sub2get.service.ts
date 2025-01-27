import axios from "axios";
import * as cheerio from "cheerio";
import { MissingParameterError } from "src/common/errors";
import { LinkShortenerService } from "../link-shortener.types";

export class Sub2GetService implements LinkShortenerService {
  public readonly name = "Sub2Get";

  async bypass(url: URL) {
    const linkId = url.searchParams.get("l");

    if (!linkId) {
      throw new MissingParameterError("l");
    }

    try {
      const { data } = await axios.get(url.href, { responseType: "document" });
      const $ = cheerio.load(data);

      const bypassedLink = $("#updateHiddenUnlocks").attr("href");

      return bypassedLink;
    } catch (error) {
      throw new Error(`Failed to fetch data from URL: ${error.message}`);
    }
  }
}
