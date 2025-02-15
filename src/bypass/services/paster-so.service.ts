import { Injectable } from "@nestjs/common";
import { HttpCurlCuffService } from "src/http-curl-cuff/http-curl-cuff.service";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { LinkProcessorHandler } from "../link-processor.types";

@Injectable()
export class PasterSoService implements LinkProcessorHandler {
  public readonly name = "PasterSo";
  private readonly _contentRegex = /{\\"content\\":\\"(.*)\\",\\"title\\"/;

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

    const data = response.data;
    const contentMatch = this._contentRegex.exec(data);

    return contentMatch[1];
  }
}
