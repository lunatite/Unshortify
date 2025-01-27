import axios from "axios";
import * as cheerio from "cheerio";
import {
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";

import { MissingParameterError } from "src/common/errors";
import { LinkShortenerService } from "../link-shortener.types";
import { BypassLinkNotFoundException } from "../exceptions/bypass-link-not-found.exception";

export class Sub2GetService implements LinkShortenerService {
  public readonly name = "Sub2Get";

  async bypass(url: URL) {
    const linkId = url.searchParams.get("l");

    if (!linkId) {
      throw new MissingParameterError("l");
    }

    let htmlContent: string;

    try {
      const response = await axios.get(url.href, {
        responseType: "text",
      });

      htmlContent = response.data;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch data from URL : ${error.message}`,
      );
    }

    const $ = cheerio.load(htmlContent);
    const bypassedLink = $("#updateHiddenUnlocks").attr("href");

    if (!bypassedLink) {
      throw new BypassLinkNotFoundException();
    }

    return bypassedLink;
  }
}
