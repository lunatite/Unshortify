import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CaptchaService } from "./captcha.interface";
import { TurnstileService } from "./services/turnstile.service";
import { CaptchaProvider } from "./captcha-provider.enum";

@Injectable()
export class CaptchaProviderService {
  private readonly captchaService?: CaptchaService;
  private readonly _selectedProvider?: CaptchaProvider;
  private readonly _siteKey?: string;
  private readonly _secretKey?: string;

  constructor(
    turnstileService: TurnstileService,
    configService: ConfigService,
  ) {
    const selectedProvider =
      configService.getOrThrow<CaptchaProvider>("CAPTCHA_PROVIDER");

    this._selectedProvider = selectedProvider;

    switch (selectedProvider) {
      case CaptchaProvider.Turnstile:
        this.captchaService = turnstileService;
        this._siteKey = configService.getOrThrow<string>("TURNSTILE_SITE_KEY");
        this._secretKey = configService.getOrThrow<string>(
          "TURNSTILE_SECRET_KEY",
        );
        break;
      default:
        this._siteKey = null;
        this._secretKey = null;
        this._selectedProvider = null;
        this.captchaService = null;
    }
  }

  async verifyCaptcha(token: string, ip?: string) {
    if (!this.captchaService) {
      return true;
    }

    return this.captchaService.verifyCaptcha(token, ip);
  }

  get selectedProvider() {
    return this._selectedProvider;
  }

  get captchaSiteKey() {
    return this._siteKey;
  }

  get captchaSecretKey() {
    return this._secretKey;
  }
}
