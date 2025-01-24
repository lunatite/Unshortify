import { BadRequestException, Injectable } from "@nestjs/common";
import { Sub2GetService } from "./services/sub2get.service";
import { LinkShortenerService } from "./common/types/link-shortener-service.type";

@Injectable()
export class AppService {
  constructor(private readonly sub2getService: Sub2GetService) {}

  async getHello(url: string) {
    const parsedUrl = new URL(url);
    const parsedUrlHost = parsedUrl.hostname;
    let linkShortenerService: LinkShortenerService;

    switch (parsedUrlHost) {
      case "www.sub2get.com":
      case "sub2get.com":
        linkShortenerService = this.sub2getService;
        break;
      default:
        throw new BadRequestException(
          `The hostname '${parsedUrlHost}' is not supported. Please provide a valid link from a supported link shortener.`,
        );
    }

    const bypassedLink = await linkShortenerService.bypass(parsedUrl);

    return {
      name: linkShortenerService.name,
      data: bypassedLink,
    };
  }
}
