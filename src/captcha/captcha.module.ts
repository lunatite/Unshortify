import { Module } from "@nestjs/common";
import { TurnstileService } from "./services/turnstile.service";
import { CaptchaProviderService } from "./captcha-provider.service";

@Module({
  providers: [TurnstileService, CaptchaProviderService],
  exports: [CaptchaProviderService],
})
export class CaptchaModule {}
