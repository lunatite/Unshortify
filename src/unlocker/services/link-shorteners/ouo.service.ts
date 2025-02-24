import { Injectable } from "@nestjs/common";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { SupportedHosts } from "src/unlocker/decorators/supported-hosts.decorator";
import { FastApiCurlClientFactory } from "src/fast-api-curl-proxy/fast-api-curl-client.factory";
import { UnlockerResult, UnlockerService } from "../unlocker.type";

@Injectable()
@SupportedHosts(["ouo.io"])
export class OuoService implements UnlockerService {
  public readonly name = "Ouo";

  constructor(private readonly httpClientFactory: FastApiCurlClientFactory) {}

  async unlock(url: URL): Promise<UnlockerResult> {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

    const pathSegments = url.pathname.split("/");

    if (pathSegments.length !== 2) {
      throw new InvalidPathException("/{id}");
    }

    const id = pathSegments[1];

    const client = this.httpClientFactory.createClient({
      impersonate: "safari",
      return_data: false,
    });

    const response = await client.post({
      url: `https://ouo.press/go/${id}`,
    });

    return {
      type: "url",
      content: response.url,
    };
  }
}
