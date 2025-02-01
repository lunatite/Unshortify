import { Injectable } from "@nestjs/common";
import { LinkProcessorHandler } from "./link-processor.types";
import { AdFocusService } from "./services/adfocus.service";
import { BoostInkService } from "./services/boostink.service";
import { LootLabsService } from "./services/lootlabs.service";
import { MBoostMeService } from "./services/mboostme.service";
import { Sub2GetService } from "./services/sub2get.service";
import { LinkvertiseService } from "./services/linkvertise/linkvertise.service";
import { RekoniseService } from "./services/rekonise.service";
import { HostNotSupported } from "./exceptions/host-not-supported.exception";

@Injectable()
export class LinkProcessorService {
  private readonly serviceMap: Map<string, LinkProcessorHandler>;
  private readonly supportedServices: string[];

  constructor(
    adFocusService: AdFocusService,
    boostInkService: BoostInkService,
    lootlabsService: LootLabsService,
    mBoostMeService: MBoostMeService,
    sub2getService: Sub2GetService,
    linkvertiseService: LinkvertiseService,
    rekoniseService: RekoniseService,
  ) {
    this.serviceMap = new Map();

    this.serviceMap.set("www.sub2get.com", sub2getService);
    this.serviceMap.set("sub2get.com", sub2getService);

    this.serviceMap.set("bst.gg", boostInkService);
    this.serviceMap.set("bst.wtf", boostInkService);
    this.serviceMap.set("boost.ink", boostInkService);
    this.serviceMap.set("booo.st", boostInkService);

    this.serviceMap.set("adfoc.us", adFocusService);
    this.serviceMap.set("mboost.me", mBoostMeService);
    this.serviceMap.set("lootdest.org", lootlabsService);
    this.serviceMap.set("loot-link.com", lootlabsService);
    this.serviceMap.set("linkvertise.com", linkvertiseService);
    this.serviceMap.set("rekonise.com", rekoniseService);

    this.supportedServices = Array.from(this.serviceMap.keys());
  }

  async process(url: URL) {
    const linkProcessingService = this.serviceMap.get(url.hostname);

    if (!linkProcessingService) {
      throw new HostNotSupported(url);
    }

    const result = await linkProcessingService.resolve(url);

    return {
      name: linkProcessingService.name,
      result,
    };
  }

  async getSupportedServices() {
    return this.supportedServices;
  }
}
