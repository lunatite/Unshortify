import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { Sub2GetService } from "./services/sub2get.service";
import { BoostInkService } from "./services/boostink.service";
import { AdFocusService } from "./services/adfocus.service";
import { MBoostMeService } from "./services/mboostme.service";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    Sub2GetService,
    AdFocusService,
    BoostInkService,
    MBoostMeService,
    AppService,
  ],
})
export class AppModule {}
