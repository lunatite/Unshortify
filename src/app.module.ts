import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { Sub2GetService } from "./link-shortener/services/sub2get.service";
import { BoostInkService } from "./link-shortener/services/boostink.service";
import { AdFocusService } from "./link-shortener/services/adfocus.service";
import { MBoostMeService } from "./link-shortener/services/mboostme.service";
import { LootLabsService } from "./link-shortener/services/lootlabs.service";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    Sub2GetService,
    AdFocusService,
    BoostInkService,
    MBoostMeService,
    LootLabsService,
    AppService,
  ],
})
export class AppModule {}
