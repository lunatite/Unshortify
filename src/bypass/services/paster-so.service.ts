import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { HttpCurlCuffService } from "src/http-curl-cuff/http-curl-cuff.service";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { LinkProcessorHandler } from "../link-processor.types";
import { BypassLinkNotFoundException } from "../exceptions/bypass-link-not-found.exception";

@Injectable()
export class PasterSoService implements LinkProcessorHandler {
  public readonly name = "PasterSo";
  private readonly _contentRegex = /{\\"content\\":\\"(.*?)\",\\"title\\"/;

  constructor(private readonly httpService: HttpCurlCuffService) {}

  async resolve(url: URL) {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

    if (url.pathname.split("/").length !== 2) {
      throw new InvalidPathException("/{id}");
    }

    const response = await this.httpService.request<string>({
      url: url.href,
      method: "get",
      impersonate: "chrome",
    });

    if (response.status_code !== 200) {
      throw new InternalServerErrorException(
        `Unexpected response status: ${response.status_code} from ${url.href}`,
      );
    }

    const contentMatch = this._contentRegex.exec(response.data);

    if (!contentMatch || !contentMatch[1]) {
      throw new BypassLinkNotFoundException();
    }

    const encodedString = contentMatch[1];

    const decodedString = encodedString.replace(/\\u[\dA-F]{4}/gi, (match) =>
      String.fromCharCode(parseInt(match.replace(/\\u/g, ""), 16)),
    );

    return decodedString;
  }
}
