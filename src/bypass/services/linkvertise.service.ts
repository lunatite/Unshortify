import { HttpService } from "@nestjs/axios";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LinkProcessorHandler } from "src/bypass/link-processor.types";

type LinkvertiseApiResponse = {
  success: boolean;
  result?: string;
  error?: string;
};

@Injectable()
export class LinkvertiseService implements LinkProcessorHandler {
  public readonly name = "Linkvertise";
  private readonly proxy;

  constructor(
    private readonly httpService: HttpService,
    configService: ConfigService,
  ) {
    this.proxy = configService.get("HTTP_PROXY");
  }

  async resolve(url: URL) {
    const response = await fetch("http://linkvertise-app:8000", {
      body: JSON.stringify({
        link: url.href,
        proxy: this.proxy,
      }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = (await response.json()) as LinkvertiseApiResponse;

    if (!data.success) {
      throw new InternalServerErrorException(data.error);
    }

    return data.result!;
  }
}
