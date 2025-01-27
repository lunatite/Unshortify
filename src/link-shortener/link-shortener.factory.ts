import { Injectable } from "@nestjs/common";
import { LinkShortenerService } from "./link-shortener.types";
import { AdFocusService } from "./services/adfocus.service";
import { BoostInkService } from "./services/boostink.service";
import { LootLabsService } from "./services/lootlabs.service";
import { MBoostMeService } from "./services/mboostme.service";
import { Sub2GetService } from "./services/sub2get.service";
import { HostNotSupported } from "./errors/host-not-supported.exception";

@Injectable()
export class LinkShortenerFactory {
  constructor(
    private readonly adFocusService: AdFocusService,
    private readonly boostInkService: BoostInkService,
    private readonly lootlabsService: LootLabsService,
    private readonly mBoostMeService: MBoostMeService,
    private readonly sub2getService: Sub2GetService,
  ) {}

  async getBypassedLink(url: URL) {
    const urlHostname = url.hostname;
    let linkShortenerService: LinkShortenerService;

    switch (urlHostname) {
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
        throw new HostNotSupported(url);
    }

    const bypassedLink = await linkShortenerService.bypass(url);

    return {
      name: linkShortenerService.name,
      link: bypassedLink,
    };
  }
}
