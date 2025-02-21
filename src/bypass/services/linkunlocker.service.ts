import { HttpService } from "@nestjs/axios";
import * as cheerio from "cheerio";
import { Injectable } from "@nestjs/common";
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
      throw new Error(
        "Failed to extract script content. The expected script might have changed or is missing.",
      );
    }

    return extractMatch(scriptContent, this.randomIdRegex);
  }

  private async getPageMetadata(
    url: URL,
  ): Promise<{ encryptedId: string; unlockerId: string }> {
    const { data: html } = await this.httpService.axiosRef.get(url.href, {
      responseType: "text",
    });

    const unlockerId = extractMatch(html, this.unlockerIdRegex);

    if (!unlockerId) {
      throw new Error("Unlocker id not found in response");
    }

    const secureTarget = extractMatch(html, this.secureTargetRegex);

    if (!secureTarget) {
      throw new Error("Secure target not found in response");
    }

    if (secureTarget.length > 60) {
      return {
        encryptedId: secureTarget,
        unlockerId,
      };
    }

    const randomId = this.extractRandomIdFromScript(html);

    if (!randomId) {
      throw new Error("Random id not found in response");
    }

    return {
      encryptedId: secureTarget + randomId,
      unlockerId,
    };
  }

  async resolve(url: URL) {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

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
