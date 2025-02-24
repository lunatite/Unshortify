import { Injectable } from "@nestjs/common";
import { stripHtml } from "string-strip-html";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { extractMatch } from "src/utils/extractMatch";
import { PasteNotFoundError } from "./errors/paste-not-found.error";
import { SupportedHosts } from "src/unlocker/decorators/supported-hosts.decorator";
import { FastApiCurlClientFactory } from "src/fast-api-curl-proxy/fast-api-curl-client.factory";
import { UnlockerResult, UnlockerService } from "../unlocker.type";

@Injectable()
@SupportedHosts(["paster.so"])
export class PasterSoService implements UnlockerService {
  public readonly name = "PasterSo";

  private static readonly CONTENT_REGEX =
    /{\\"content\\":\\"(.*?)\",\\"title\\"/;

  constructor(private readonly httpClientFactory: FastApiCurlClientFactory) {}

  async unlock(url: URL): Promise<UnlockerResult> {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

    if (url.pathname.split("/").length !== 2) {
      throw new InvalidPathException("/{id}");
    }

    const client = await this.httpClientFactory.createClient();
    const response = await client.get<string>({
      url: url.href,
      impersonate: "chrome",
    });

    const encodedPaste = extractMatch(
      response.data,
      PasterSoService.CONTENT_REGEX,
    );

    if (!encodedPaste) {
      throw new PasteNotFoundError(url);
    }

    const decodedString = encodedPaste.replace(/\\u[\dA-F]{4}/gi, (match) =>
      String.fromCharCode(parseInt(match.replace(/\\u/g, ""), 16)),
    );

    return {
      type: "paste",
      content: stripHtml(decodedString).result,
    };
  }
}
