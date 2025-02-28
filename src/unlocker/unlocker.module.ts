import { Module } from "@nestjs/common";
import { CaptchaModule } from "src/security/captcha/captcha.module";
import { CaptchaSolverModule } from "src/captcha-solver/captcha-solver.module";
import { FastApiCurlClientFactoryModule } from "src/fast-api-curl-proxy/fastapi-curl-proxy.module";
import services from "./services";
import { UnlockerController } from "./unlocker.controller";
import { LinkProcessorService } from "./link-processer.service";

@Module({
  imports: [FastApiCurlClientFactoryModule, CaptchaModule, CaptchaSolverModule],
  controllers: [UnlockerController],
  providers: [...services, LinkProcessorService],
})
export class UnlockerModule {}
