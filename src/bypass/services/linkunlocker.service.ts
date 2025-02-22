import { HttpService } from "@nestjs/axios";
import * as cheerio from "cheerio";
import { Injectable } from "@nestjs/common";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { extractMatch } from "src/utils/extractMatch";

@Injectable()
export class LinkUnlockerService implements LinkProcessorHandler {
  public readonly name = "LinkUnlocker";

  private static readonly UNLOCKER_ID_REGEX = /\\"_id\\":\\"(.*?)\\"/;
  private static readonly SECURE_TARGET_REGEX =
    /\\"_secureTarget\\":\\"(.*?)(\\|)\"/;
  private static readonly RANDOM_ID_REGEX =
    /self\.__next_f\.push\(\[\d*,\"(.*?)\\"/;

  private static readonly GENERATE_TOKEN_URL =
    "https://linkunlocker.com/api/generate-token";
  private static readonly DECRYPT_URL =
    "https://linkunlocker.com/api/decrypt-url";
  private static readonly ORIGIN_URL = "https://linkunlocker.com";

  private static readonly ENCRYPTED_ID_REQUIRED_LENGTH_CHECK = 60;

  constructor(private readonly httpService: HttpService) {}

  private async generateUnlockerToken(unlockerId: string) {
    const response = await this.httpService.axiosRef.post<{ token: string }>(
      LinkUnlockerService.GENERATE_TOKEN_URL,
      { unlockerId },
      {
        headers: {
          Origin: LinkUnlockerService.ORIGIN_URL,
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
      LinkUnlockerService.DECRYPT_URL,
      {
        encryptedUrl,
        requestToken: unlockerToken,
        unlockerId,
      },
      {
        headers: {
          Origin: LinkUnlockerService.ORIGIN_URL,
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
        "Failed to extract script content. The expected script may have changed or is missing from the HTML",
      );
    }

    return extractMatch(scriptContent, LinkUnlockerService.RANDOM_ID_REGEX);
  }

  private async getPageMetadata(
    url: URL,
  ): Promise<{ encryptedId: string; unlockerId: string }> {
    const { data: html } = await this.httpService.axiosRef.get(url.href, {
      responseType: "text",
    });

    const unlockerId = extractMatch(
      html,
      LinkUnlockerService.UNLOCKER_ID_REGEX,
    );

    if (!unlockerId) {
      throw new Error(
        "Failed to extract the unlocker ID. The unlocker ID format may have changed,or is missing",
      );
    }

    const secureTarget = extractMatch(
      html,
      LinkUnlockerService.SECURE_TARGET_REGEX,
    );

    if (!secureTarget) {
      throw new Error(
        "Failed to extract the secure target. The secure target format may have changed or is missing",
      );
    }

    // An arbitary number length check. If it's really long then we need the encrypted Id.
    if (
      secureTarget.length >
      LinkUnlockerService.ENCRYPTED_ID_REQUIRED_LENGTH_CHECK
    ) {
      return {
        encryptedId: secureTarget,
        unlockerId,
      };
    }

    const randomId = this.extractRandomIdFromScript(html);

    if (!randomId) {
      throw new Error(
        "Failed to extract the random id. The random ID format may have changed or is missing",
      );
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
