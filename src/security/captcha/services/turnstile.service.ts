import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { CaptchaService } from "../captcha.interface";

type TurnstileVerifyResponse = {
  success: boolean;
  challenge_ts: string;
  "error-codes": string[];
  hostname?: string;
  action?: string;
};

@Injectable()
export class TurnstileService implements CaptchaService {
  private readonly verifyUrl =
    "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  private readonly secretKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.secretKey = this.configService.getOrThrow("TURNSTILE_SECRET_KEY");
  }

  async verifyCaptcha(token: string, ip?: string) {
    const { data } =
      await this.httpService.axiosRef.post<TurnstileVerifyResponse>(
        this.verifyUrl,
        {
          secret: this.secretKey,
          response: token,
          remoteip: ip,
        },
        {
          proxy: false,
        },
      );

    return {
      success: data.success,
      errorCodes: data["error-codes"],
      hostname: data.hostname,
      action: data.action,
    };
  }
}
