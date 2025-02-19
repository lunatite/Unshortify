import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { CaptchaProviderService } from "./captcha-provider.service";
import { ConfigService } from "@nestjs/config";
import { CaptchaProvider } from "./captcha-provider.enum";

@Injectable()
export class CaptchaGuard implements CanActivate {
  private isCaptchaEnabled = false;

  constructor(
    private readonly captchaFactoryService: CaptchaProviderService,
    configService: ConfigService,
  ) {
    if (configService.get<CaptchaProvider>("CAPTCHA_PROVIDER")) {
      this.isCaptchaEnabled = true;
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const captchaToken = request.body.captchaToken;
    const clientIp =
      (request.headers["x-forwarded-for"] as string)?.split(",")[0] ??
      request.ip;

    if (!this.isCaptchaEnabled) {
      return true;
    }

    if (!captchaToken) {
      throw new BadRequestException(["captchaToken must be a string"]);
    }

    let result;

    try {
      result = await this.captchaFactoryService.verifyCaptcha(
        captchaToken,
        clientIp,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        "Error during CAPTCHA verification",
      );
    }

    if (!result.success) {
      throw new BadRequestException("Captcha verification failed");
    }

    return true;
  }
}
