import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { SupportedHosts } from "../decorators/supported-hosts.decorator";

@Injectable()
@SupportedHosts(["tinyurl.com"])
export class TinyUrlService implements LinkProcessorHandler {
  public readonly name = "TinyUrl";

  constructor(private readonly httpService: HttpService) {}

  async resolve(url: URL) {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

    const response = await this.httpService.axiosRef.get(url.href, {
      maxRedirects: 3,
    });

    const finalUrl = response.request.res.responseUrl;
    return finalUrl;
  }
}
