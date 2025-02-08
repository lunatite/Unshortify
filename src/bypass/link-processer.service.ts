import { Inject, Injectable } from "@nestjs/common";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { ConfigService } from "@nestjs/config";
import { LinkProcessorHandler } from "./link-processor.types";
import { AdFocusService } from "./services/adfocus.service";
import { BoostInkService } from "./services/boostink.service";
import { LootLabsService } from "./services/lootlabs.service";
import { MBoostMeService } from "./services/mboostme.service";
import { Sub2GetService } from "./services/sub2get.service";
import { LinkvertiseService } from "./services/linkvertise/linkvertise.service";
import { RekoniseService } from "./services/rekonise.service";
import { Sub2UnlockService } from "./services/sub2unlock.service";
import { SocialWolvezService } from "./services/socialwolvez.service";
import { SubFinalService } from "./services/subfinal.service";
import { HostNotSupported } from "./exceptions/host-not-supported.exception";

@Injectable()
export class LinkProcessorService {
  private readonly serviceMap: Map<string, LinkProcessorHandler>;
  private readonly supportedServices: string[];
  private readonly isCacheEnabled: boolean;
  private readonly cacheTTL: number;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    configService: ConfigService,
    adFocusService: AdFocusService,
    boostInkService: BoostInkService,
    lootlabsService: LootLabsService,
    mBoostMeService: MBoostMeService,
    sub2getService: Sub2GetService,
    linkvertiseService: LinkvertiseService,
    rekoniseService: RekoniseService,
    sub2UnlockService: Sub2UnlockService,
    socialWolvezService: SocialWolvezService,
    subFinalService: SubFinalService,
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
    this.serviceMap.set("loot-links.com", lootlabsService);

    if (linkvertiseService.isEnabled) {
      this.serviceMap.set("linkvertise.com", linkvertiseService);
    }

    this.serviceMap.set("rekonise.com", rekoniseService);
    this.serviceMap.set("sub2unlock.me", sub2UnlockService);
    this.serviceMap.set("subfinal.com", subFinalService);

    this.serviceMap.set("socialwolvez.com", socialWolvezService);

    this.supportedServices = Array.from(this.serviceMap.keys());

    this.isCacheEnabled = configService.getOrThrow<boolean>("CACHE_ENABLED");
    this.cacheTTL = configService.getOrThrow<number>("CACHE_TTL");
  }

  async process(url: URL) {
    const linkProcessingService = this.serviceMap.get(url.hostname);

    if (!linkProcessingService) {
      throw new HostNotSupported(url);
    }

    if (this.isCacheEnabled) {
      const cachedResult = await this.cache.get(url.href);
      if (cachedResult !== null) {
        return { name: linkProcessingService.name, result: cachedResult };
      }
    }

    const result = await linkProcessingService.resolve(url);

    if (this.isCacheEnabled) {
      await this.cache.set(url.href, result, this.cacheTTL * 1000);
    }

    return { name: linkProcessingService.name, result };
  }

  async getSupportedServices() {
    return this.supportedServices;
  }
}
