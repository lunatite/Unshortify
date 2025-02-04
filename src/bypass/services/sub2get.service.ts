import * as cheerio from "cheerio";
import { MissingParameterError } from "src/common/errors";
import { LinkProcessorHandler } from "../link-processor.types";
import { BypassLinkNotFoundException } from "../exceptions/bypass-link-not-found.exception";
import { HttpClient } from "src/http-client/http-client";

export class Sub2GetService implements LinkProcessorHandler {
  public readonly name = "Sub2Get";

  constructor(private readonly httpClient: HttpClient) {}

  private async fetchBypassedLink(url: URL): Promise<string> {
    const { data: htmlContent } = await this.httpClient.get<string>(url.href, {
      responseType: "text",
    });

    const $ = cheerio.load(htmlContent);
    const bypassedLink = $("#updateHiddenUnlocks").attr("href");

    if (!bypassedLink) {
      throw new BypassLinkNotFoundException();
    }

    return bypassedLink;
  }

  async resolve(url: URL) {
    const linkId = url.searchParams.get("l");

    if (!linkId) {
      throw new MissingParameterError("l");
    }

    const bypassedLink = await this.fetchBypassedLink(url);
    return bypassedLink;
  }
}
