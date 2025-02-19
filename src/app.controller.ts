import { Controller, Get, Render } from "@nestjs/common";
import { CaptchaProviderService } from "./captcha/captcha-provider.service";

@Controller("/")
export class AppController {
  constructor(
    private readonly captchaProviderService: CaptchaProviderService,
  ) {}

  @Get("/")
  @Render("index")
  root() {
    return {
      captchaProvider: this.captchaProviderService.selectedProvider,
      captchaSiteKey: this.captchaProviderService.captchaSiteKey,
    };
  }
}
