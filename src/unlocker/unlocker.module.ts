import { Module } from "@nestjs/common";
import { CaptchaModule } from "src/security/captcha/captcha.module";
import services from "./services";
import { UnlockerController } from "./unlocker.controller";
import { FastApiCurlClientFactoryModule } from "src/fast-api-curl-proxy/fastapi-curl-proxy.module";
import { LinkProcessorService } from "./link-processer.service";

@Module({
  imports: [FastApiCurlClientFactoryModule, CaptchaModule],
  controllers: [UnlockerController],
  providers: [...services, LinkProcessorService],
})
export class UnlockerModule {}
