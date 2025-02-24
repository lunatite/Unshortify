import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { SupportedHosts } from "src/unlocker/decorators/supported-hosts.decorator";
import { UnlockerResult, UnlockerService } from "../unlocker.type";

@Injectable()
@SupportedHosts(["tinyurl.com"])
export class TinyUrlService implements UnlockerService {
  public readonly name = "TinyUrl";

  constructor(private readonly httpService: HttpService) {}

  async unlock(url: URL): Promise<UnlockerResult> {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

    const response = await this.httpService.axiosRef.get(url.href, {
      maxRedirects: 3,
    });

    const finalUrl = response.request.res.responseUrl;

    return {
      type: "url",
      content: finalUrl,
    };
  }
}
