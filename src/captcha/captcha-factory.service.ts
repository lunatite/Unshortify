import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CaptchaService } from "./captcha.interface";
import { TurnstileService } from "./services/turnstile.service";
import { CaptchaProvider } from "./captcha.provider.enum";

@Injectable()
export class CaptchaFactoryService {
  private provider: CaptchaService;

  constructor(
    private turnstileService: TurnstileService,
    private configService: ConfigService,
  ) {
    const selectedProvider =
      configService.getOrThrow<CaptchaProvider>("CAPTCHA_PROVIDER");

    switch (selectedProvider) {
      case CaptchaProvider.Turnstile:
        this.provider = turnstileService;
        break;
      default:
        this.provider = turnstileService;
        break;
    }
  }

  async verifyCaptcha(token: string, ip?: string) {
    return this.provider.verifyCaptcha(token, ip);
  }
}
