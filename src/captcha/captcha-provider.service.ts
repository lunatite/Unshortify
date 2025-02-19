import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CaptchaService } from "./captcha.interface";
import { TurnstileService } from "./services/turnstile.service";
import { CaptchaProvider } from "./captcha-provider.enum";

@Injectable()
export class CaptchaProviderService {
  private readonly providerService: CaptchaService;
  private readonly providerName: CaptchaProvider;
  private readonly siteKey: string;
  private readonly secretKey: string;

  constructor(
    turnstileService: TurnstileService,
    configService: ConfigService,
  ) {
    const selectedProvider =
      configService.getOrThrow<CaptchaProvider>("CAPTCHA_PROVIDER");

    switch (selectedProvider) {
      case CaptchaProvider.Turnstile:
        this.providerService = turnstileService;
        this.siteKey = configService.getOrThrow<string>("TURNSTILE_SITE_KEY");
        this.secretKey = configService.getOrThrow<string>(
          "TURNSTILE_SECRET_KEY",
        );
        break;
      default:
        this.siteKey = configService.getOrThrow<string>("TURNSTILE_SITE_KEY");
        this.secretKey = configService.getOrThrow<string>(
          "TURNSTILE_SECRET_KEY",
        );
        this.providerService = turnstileService;
        break;
    }
  }

  async verifyCaptcha(token: string, ip?: string) {
    return this.providerService.verifyCaptcha(token, ip);
  }

  getCurrentProvider(): CaptchaProvider {
    return this.providerName;
  }

  getSiteKey() {
    return this.siteKey;
  }

  getSecretKey() {
    return this.secretKey;
  }
}
