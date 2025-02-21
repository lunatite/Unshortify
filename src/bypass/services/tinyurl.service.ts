import { BadRequestException, Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { AxiosError } from "axios";

import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";

@Injectable()
export class TinyUrlService implements LinkProcessorHandler {
  public readonly name = "TinyUrl";

  constructor(private readonly httpService: HttpService) {}

  async resolve(url: URL) {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

    try {
      const response = await this.httpService.axiosRef.get(url.href, {
        maxRedirects: 3,
      });

      const finalUrl = response.request.res.responseUrl;
      return finalUrl;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response.status === 404) {
          throw new BadRequestException("The requested page cannot be found");
        }
      }
    }
  }
}
