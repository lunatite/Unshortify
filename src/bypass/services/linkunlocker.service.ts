import { HttpService } from "@nestjs/axios";
import * as cheerio from "cheerio";
import { BadRequestException, Injectable } from "@nestjs/common";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { extractMatch } from "src/utils/extractMatch";

@Injectable()
export class LinkUnlockerService implements LinkProcessorHandler {
  public readonly name = "LinkUnlocker";
  private readonly unlockerIdRegex = /\\"_id\\":\\"(.*?)\\"/;
  private readonly secureTargetRegex = /\\"_secureTarget\\":\\"(.*?)(\\|)\"/;
  private readonly randomIdRegex = /self\.__next_f\.push\(\[\d*,\"(.*?)\\"/;

  constructor(private readonly httpService: HttpService) {}

  private async generateUnlockerToken(unlockerId: string) {
    const response = await this.httpService.axiosRef.post<{ token: string }>(
      "https://linkunlocker.com/api/generate-token",
      { unlockerId },
      {
        headers: {
          Origin: "https://linkunlocker.com",
        },
      },
    );

    return response.data.token;
  }

  private async decryptUrl(
    encryptedUrl: string,
    unlockerToken: string,
    unlockerId: string,
  ) {
    const response = await this.httpService.axiosRef.post<{ url: string }>(
      "https://linkunlocker.com/api/decrypt-url",
      {
        encryptedUrl,
        requestToken: unlockerToken,
        unlockerId,
      },
      {
        headers: {
          Origin: "https://linkunlocker.com",
        },
      },
    );

    return response.data.url;
  }

  private extractRandomIdFromScript(html: string) {
    const $ = cheerio.load(html);
    const scripts = $("script");
    const scriptContent = scripts.eq(scripts.length - 5).html();

    if (!scriptContent) {
      throw new Error("Could not extract script content");
    }

    return extractMatch(scriptContent, this.randomIdRegex, "random id");
  }

  private async getPageMetadata(
    url: URL,
  ): Promise<{ encryptedId: string; unlockerId: string }> {
    const { data: html } = await this.httpService.axiosRef.get(url.href, {
      responseType: "text",
    });

    const unlockerId = extractMatch(html, this.unlockerIdRegex, "unlocker id");
    const secureTarget = extractMatch(
      html,
      this.secureTargetRegex,
      "secure target",
    );

    if (secureTarget.length > 60) {
      return {
        encryptedId: secureTarget,
        unlockerId,
      };
    }

    const randomId = this.extractRandomIdFromScript(html);

    return {
      encryptedId: secureTarget + randomId,
      unlockerId,
    };
  }

  async resolve(url: URL) {
    const { encryptedId, unlockerId } = await this.getPageMetadata(url);
    const unlockerToken = await this.generateUnlockerToken(unlockerId);
    const decryptedUrl = await this.decryptUrl(
      encryptedId,
      unlockerToken,
      unlockerId,
    );

    return decryptedUrl;
  }
}
