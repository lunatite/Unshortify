import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { HttpCurlCuffService } from "src/http-curl-cuff/http-curl-cuff.service";
import { ShortenedLinkNotFoundError } from "../errors/shortened-link-not-found.error";

@Injectable()
export class OuoService implements LinkProcessorHandler {
  public readonly name = "Ouo";

  constructor(private readonly httpService: HttpCurlCuffService) {}

  async resolve(url: URL): Promise<string> {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

    const pathSegments = url.pathname.split("/");

    if (pathSegments.length !== 2) {
      throw new InvalidPathException("/{id}");
    }

    const id = pathSegments[1];

    const response = await this.httpService.request({
      url: `https://ouo.press/go/${id}`,
      method: "post",
      impersonate: "safari",
      return_data: false,
    });

    if (response.status_code !== 200) {
      throw new ShortenedLinkNotFoundError(url);
    }

    return response.url;
  }
}
