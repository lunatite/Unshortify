import { Injectable } from "@nestjs/common";
import { BypassLinkService } from "./bypass.types";
import { AdFocusService } from "./services/adfocus.service";
import { BoostInkService } from "./services/boostink.service";
import { LootLabsService } from "./services/lootlabs.service";
import { MBoostMeService } from "./services/mboostme.service";
import { Sub2GetService } from "./services/sub2get.service";
import { HostNotSupported } from "./exceptions/host-not-supported.exception";
import { LinkvertiseService } from "./services/linkvertise/linkvertise.service";

@Injectable()
export class BypassResolver {
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
    let bypassLinkService: BypassLinkService;

    switch (urlHostname) {
      case "sub2get.com":
        bypassLinkService = this.sub2getService;
        break;
      case "boost.ink":
        bypassLinkService = this.boostInkService;
        break;
      case "adfoc.us":
        bypassLinkService = this.adFocusService;
        break;
      case "mboost.me":
        bypassLinkService = this.mBoostMeService;
        break;
      case "lootdest.org":
      case "loot-link.com":
        bypassLinkService = this.lootlabsService;
        break;
      case "linkvertise.com":
        bypassLinkService = this.linkvertiseService;
        break;
      default:
        throw new HostNotSupported(url);
    }

    const bypassedLink = await bypassLinkService.bypass(url);

    return {
      name: bypassLinkService.name,
      link: bypassedLink,
    };
  }
}
