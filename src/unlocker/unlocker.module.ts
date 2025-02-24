import { Module } from "@nestjs/common";
import services from "./services";
import { UnlockerController } from "./unlocker.controller";
import { FastApiCurlClientFactoryModule } from "src/fast-api-curl-proxy/fastapi-curl-proxy.module";
import { LinkProcessorService } from "./link-processer.service";

@Module({
  imports: [FastApiCurlClientFactoryModule],
  controllers: [UnlockerController],
  providers: [...services, LinkProcessorService],
})
export class UnlockerModule {}
