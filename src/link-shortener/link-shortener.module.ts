import { Module } from "@nestjs/common";
import { AdFocusService } from "./services/adfocus.service";
import { BoostInkService } from "./services/boostink.service";
import { LootLabsService } from "./services/lootlabs.service";
import { MBoostMeService } from "./services/mboostme.service";
import { Sub2GetService } from "./services/sub2get.service";
import { LinkShortenerFactory } from "./link-shortener.factory";

@Module({
  providers: [
    AdFocusService,
    BoostInkService,
    LootLabsService,
    MBoostMeService,
    Sub2GetService,
    LinkShortenerFactory,
  ],
  exports: [LinkShortenerFactory],
})
export class LinkShortenerModule {}
