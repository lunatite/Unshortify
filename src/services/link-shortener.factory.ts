import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { LinkShortenerService } from "src/common/types/link-shortener-service.type";
import { LinkShortenerServiceName } from "src/common/types/link-shortener-service-name.type";
import { AdFocusService } from "./adfocus.service";
import { BoostInkService } from "./boostink.service";
import { LootLabsService } from "./lootlabs.service";
import { MBoostMeService } from "./mboostme.service";
import { Sub2GetService } from "./sub2get.service";

@Injectable()
export class LinkShortenerFactory {
  constructor(
    private readonly adFocusService: AdFocusService,
    private readonly boostInkService: BoostInkService,
    private readonly lootlabsService: LootLabsService,
    private readonly mBoostMeService: MBoostMeService,
    private readonly sub2getService: Sub2GetService,
  ) {}

  getService(serviceName: LinkShortenerServiceName): LinkShortenerService {
    switch (serviceName.toLowerCase() as LinkShortenerServiceName) {
      case "adfocus":
        return this.adFocusService;
      case "boostink":
        return this.boostInkService;
      case "lootlabs":
        return this.lootlabsService;
      case "mboostme":
        return this.mBoostMeService;
      case "sub2get":
        return this.sub2getService;
      default:
        throw new InternalServerErrorException(
          `Unsupported service : ${serviceName}`,
        );
    }
  }
}
