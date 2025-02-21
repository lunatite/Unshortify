import { BadRequestException, Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { BypassLinkNotFoundException } from "../exceptions/bypass-link-not-found.exception";

@Injectable()
export class AdFocusService implements LinkProcessorHandler {
  public readonly name = "Adfocus";
  private readonly clickUrlRegex = /var click_url\s*=\s*"([^"]+)"/;

  constructor(private readonly httpService: HttpService) {}

  private async fetchBypassedLink(url: URL) {
    const response = await this.httpService.axiosRef.get<string>(url.href, {
      responseType: "text",
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (response.request.res?.responseUrl === "https://adfoc.us/") {
      throw new BadRequestException("The requested resource cannot be found");
    }

    const bypassedUrlMatch = this.clickUrlRegex.exec(response.data);

    if (!bypassedUrlMatch || !bypassedUrlMatch[1]) {
      throw new BypassLinkNotFoundException();
    }

    const bypassedUrl = bypassedUrlMatch[1];
    return bypassedUrl;
  }

  async resolve(url: URL): Promise<string> {
    if (url.pathname === "/") {
      throw new InvalidPathException("/${id}");
    }

    const bypassedLink = await this.fetchBypassedLink(url);
    return bypassedLink;
  }
}
