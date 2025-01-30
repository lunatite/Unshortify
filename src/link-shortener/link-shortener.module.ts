import { Module } from "@nestjs/common";
import { AdFocusService } from "./services/adfocus.service";
import { BoostInkService } from "./services/boostink.service";
import { LootLabsService } from "./services/lootlabs.service";
import { MBoostMeService } from "./services/mboostme.service";
import { Sub2GetService } from "./services/sub2get.service";
import { LinkvertiseService } from "./services/linkvertise/linkvertise.service";
import { LinkShortenerFactory } from "./link-shortener.factory";
import { LinkShortenerController } from "./link-shortener.controller";

@Module({
  providers: [
    AdFocusService,
    BoostInkService,
    LootLabsService,
    MBoostMeService,
    Sub2GetService,
    LinkvertiseService,
    LinkShortenerFactory,
  ],
  controllers: [LinkShortenerController],
  exports: [LinkShortenerFactory],
})
export class LinkShortenerModule {}
