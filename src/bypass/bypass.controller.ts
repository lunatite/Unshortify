import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { LinkProcessorService } from "./link-processer.service";
import { BypassLinkDto } from "./dto/bypass-link.dto";
import { CaptchaGuard } from "src/captcha/captcha.guard";
import { AxiosError } from "axios";

@Controller("api/bypass")
export class BypassController {
  constructor(private readonly service: LinkProcessorService) {}

  @UseGuards(CaptchaGuard)
  @Post("/")
  @HttpCode(200)
  async processLink(@Body() dto: BypassLinkDto) {
    try {
      const { url } = dto;
      const result = await this.service.process(new URL(url));

      return result;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error;
      }

      throw new BadRequestException(error.message);
    }
  }

  @Get("/supported")
  getSupportedServices() {
    return this.service.getSupportedServices();
  }
}
