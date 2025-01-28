import { Injectable } from "@nestjs/common";
import { LinkShortenerService } from "./link-shortener.types";
import { AdFocusService } from "./services/adfocus.service";
import { BoostInkService } from "./services/boostink.service";
import { LootLabsService } from "./services/lootlabs.service";
import { MBoostMeService } from "./services/mboostme.service";
import { Sub2GetService } from "./services/sub2get.service";
import { HostNotSupported } from "./exceptions/host-not-supported.exception";
import { LinkvertiseService } from "./services/linkvertise.service";

@Injectable()
export class LinkShortenerFactory {
  constructor(
    private readonly adFocusService: AdFocusService,
    private readonly boostInkService: BoostInkService,
    private readonly lootlabsService: LootLabsService,
    private readonly mBoostMeService: MBoostMeService,
    private readonly sub2getService: Sub2GetService,
    private readonly linkvertiseService: LinkvertiseService,
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
      case "linkvertise.com":
        linkShortenerService = this.linkvertiseService;
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
