import axios from "axios";
import * as cheerio from "cheerio";
import { LinkShortenerService } from "../link-shortener.types";
import { decodeBase64 } from "src/utils/decodeBase64";

export class BoostInkService implements LinkShortenerService {
  private readonly scriptAttribName = "bufpsvdhmjybvgfncqfa";
  public readonly name = "Boost.Ink";

  async bypass(url: URL) {
    const path = url.pathname;

    if (path === "/") {
      throw new Error("Missing id path...");
    }

    try {
      const { data } = await axios.get(url.href, { responseType: "document" });
      const $ = cheerio.load(data);

      const base64Link = $(`script[${this.scriptAttribName}]`).attr(
        this.scriptAttribName,
      );

      if (!base64Link) {
        throw new Error(
          `Script tag with attribute ${this.scriptAttribName} not found`,
        );
      }

      const bypassedLink = decodeBase64(base64Link);

      return bypassedLink;
    } catch (error) {
      console.log(error);
      throw new Error(`Failed to fetch data from URL: ${error.message}`);
    }
  }
}
