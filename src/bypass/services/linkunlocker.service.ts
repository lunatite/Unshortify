import { HttpService } from "@nestjs/axios";
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";

type TargetUrlsResponse = Array<{
  actionId: string;
  targetUrl: string;
  _id: string;
}>;

@Injectable()
export class LinkUnlockerService implements LinkProcessorHandler {
  public readonly name = "LinkUnlocker";
  private readonly targetUrlsRegex = /\\"targetUrls\\":(.*?),\\"coverImage\\"/;

  constructor(private readonly httpService: HttpService) {}

  private createAnonymousId() {
    return crypto.randomUUID();
  }

  private async getTargetUrls(url: URL): Promise<TargetUrlsResponse> {
    const { data: html } = await this.httpService.axiosRef.get(url.href, {
      responseType: "text",
    });

    const targetUrlsMatch = this.targetUrlsRegex.exec(html);

    if (!targetUrlsMatch || !targetUrlsMatch[1]) {
      throw new BadRequestException(
        "Could not find target URLs in the HTML response",
      );
    }

    const jsonString = targetUrlsMatch[1].replace(/\\"/g, '"');

    try {
      const parsedData = JSON.parse(jsonString);

      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        throw new Error("Extracted data is not a valid array");
      }

      return parsedData;
    } catch {
      throw new BadRequestException(
        "Failed to parse JSON from extracted target URLs",
      );
    }
  }

  async resolve(url: URL) {
    const targetUrls = await this.getTargetUrls(url);
    console.log(targetUrls);

    return "";
  }
}
