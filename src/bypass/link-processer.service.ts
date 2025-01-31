import { Injectable } from "@nestjs/common";
import { LinkProcessorHandler } from "./link-processor.types";
import { AdFocusService } from "./services/adfocus.service";
import { BoostInkService } from "./services/boostink.service";
import { LootLabsService } from "./services/lootlabs.service";
import { MBoostMeService } from "./services/mboostme.service";
import { Sub2GetService } from "./services/sub2get.service";
import { HostNotSupported } from "./exceptions/host-not-supported.exception";
import { LinkvertiseService } from "./services/linkvertise/linkvertise.service";

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
  ) {
    this.serviceMap = new Map();

    this.serviceMap.set("sub2get.com", sub2getService);
    this.serviceMap.set("boost.ink", boostInkService);
    this.serviceMap.set("adfoc.us", adFocusService);
    this.serviceMap.set("mboost.me", mBoostMeService);
    this.serviceMap.set("lootdest.org", lootlabsService);
    this.serviceMap.set("loot-link.com", lootlabsService);
    this.serviceMap.set("linkvertise.com", linkvertiseService);

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
