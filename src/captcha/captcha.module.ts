import { Module } from "@nestjs/common";
import { TurnstileService } from "./services/turnstile.service";
import { CaptchaFactoryService } from "./captcha-factory.service";

@Module({
  providers: [TurnstileService, CaptchaFactoryService],
  exports: [CaptchaFactoryService],
})
export class CaptchaModule {}
