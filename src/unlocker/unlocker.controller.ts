import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Get,
  UseGuards,
} from "@nestjs/common";
import { AxiosError } from "axios";
import { CaptchaGuard } from "src/security/captcha/captcha.guard";
import { UnlockLinkDto } from "./dto/unlock-link.dto";
import { LinkProcessorService } from "./link-processer.service";

@Controller("api/unlock")
export class UnlockerController {
  constructor(private readonly service: LinkProcessorService) {}

  @UseGuards(CaptchaGuard)
  @Post("/")
  @HttpCode(200)
  async process(@Body() dto: UnlockLinkDto) {
    try {
      const { link } = dto;
      const result = await this.service.process(new URL(link));
      return result;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Get("/supported")
  @HttpCode(200)
  getSupportedServices() {
    return this.service.getSupportedServices();
  }
}
