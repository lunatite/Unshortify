import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { Sub2GetService } from "./services/sub2get.service";
import { BoostInkService } from "./services/boostink.service";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [Sub2GetService, BoostInkService, AppService],
})
export class AppModule {}
