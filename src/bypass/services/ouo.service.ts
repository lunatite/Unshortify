import { Injectable } from "@nestjs/common";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { SupportedHosts } from "../decorators/supported-hosts.decorator";
import { FastApiCurlProxyService } from "src/fast-api-curl-proxy/fastapi-curl-proxy.service";

@Injectable()
@SupportedHosts(["ouo.io"])
export class OuoService implements LinkProcessorHandler {
  public readonly name = "Ouo";

  constructor(private readonly httpProxyService: FastApiCurlProxyService) {}

  async resolve(url: URL): Promise<string> {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

    const pathSegments = url.pathname.split("/");

    if (pathSegments.length !== 2) {
      throw new InvalidPathException("/{id}");
    }

    const id = pathSegments[1];

    const response = await this.httpProxyService.post({
      url: `https://ouo.press/go/${id}`,
      impersonate: "safari",
      return_data: false,
    });

    return response.url;
  }
}
