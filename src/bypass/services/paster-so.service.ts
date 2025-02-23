import { Injectable } from "@nestjs/common";
import { stripHtml } from "string-strip-html";
import { FastApiCurlProxyService } from "src/fast-api-curl-proxy/fastapi-curl-proxy.service";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { LinkProcessorHandler } from "../link-processor.types";
import { extractMatch } from "src/utils/extractMatch";
import { PasteNotFoundError } from "../errors/paste-not-found.error";
import { SupportedHosts } from "../decorators/supported-hosts.decorator";

@Injectable()
@SupportedHosts(["paster.so"])
export class PasterSoService implements LinkProcessorHandler {
  public readonly name = "PasterSo";

  private static readonly CONTENT_REGEX =
    /{\\"content\\":\\"(.*?)\",\\"title\\"/;

  constructor(private readonly httpProxyService: FastApiCurlProxyService) {}

  async resolve(url: URL) {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

    if (url.pathname.split("/").length !== 2) {
      throw new InvalidPathException("/{id}");
    }

    const response = await this.httpProxyService.get<string>({
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

    return stripHtml(decodedString).result;
  }
}
