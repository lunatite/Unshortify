import { Injectable } from "@nestjs/common";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { SupportedHosts } from "../decorators/supported-hosts.decorator";
import { FastApiCurlClientFactory } from "src/fast-api-curl-proxy/fast-api-curl-client.factory";

@Injectable()
@SupportedHosts(["ouo.io"])
export class OuoService implements LinkProcessorHandler {
  public readonly name = "Ouo";

  constructor(
    private readonly fastApiCurlClientFactory: FastApiCurlClientFactory,
  ) {}

  async resolve(url: URL): Promise<string> {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

    const pathSegments = url.pathname.split("/");

    if (pathSegments.length !== 2) {
      throw new InvalidPathException("/{id}");
    }

    const id = pathSegments[1];

    const client = this.fastApiCurlClientFactory.createClient({
      impersonate: "safari",
      return_data: false,
    });

    const response = await client.post({
      url: `https://ouo.press/go/${id}`,
    });

    return response.url;
  }
}
