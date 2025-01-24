import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { Sub2GetService } from "./services/sub2get.service";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [Sub2GetService, AppService],
})
export class AppModule {}
