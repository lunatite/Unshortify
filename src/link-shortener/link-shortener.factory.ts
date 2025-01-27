import { BadRequestException, Injectable } from "@nestjs/common";
import { LinkShortenerService } from "src/common/types/link-shortener-service.type";
import { AdFocusService } from "./services/adfocus.service";
import { BoostInkService } from "./services/boostink.service";
import { LootLabsService } from "./services/lootlabs.service";
import { MBoostMeService } from "./services/mboostme.service";
import { Sub2GetService } from "./services/sub2get.service";

@Injectable()
export class LinkShortenerFactory {
  constructor(
    private readonly adFocusService: AdFocusService,
    private readonly boostInkService: BoostInkService,
    private readonly lootlabsService: LootLabsService,
    private readonly mBoostMeService: MBoostMeService,
    private readonly sub2getService: Sub2GetService,
  ) {}

  async getBypassedLink(url: string) {
    const parsedUrl = new URL(url);
    const parsedUrlHost = parsedUrl.hostname;
    let linkShortenerService: LinkShortenerService;

    switch (parsedUrlHost) {
      case "sub2get.com":
        linkShortenerService = this.sub2getService;
        break;
      case "boost.ink":
        linkShortenerService = this.boostInkService;
        break;
      case "adfoc.us":
        linkShortenerService = this.adFocusService;
        break;
      case "mboost.me":
        linkShortenerService = this.mBoostMeService;
        break;
      case "lootdest.org":
      case "loot-link.com":
        linkShortenerService = this.lootlabsService;
        break;
      default:
        throw new BadRequestException(
          "The hostname '${parsedUrlHost}' is not supported",
        );
    }

    const bypassedLink = await linkShortenerService.bypass(parsedUrl);

    return {
      name: linkShortenerService.name,
      link: bypassedLink,
    };
  }
}
