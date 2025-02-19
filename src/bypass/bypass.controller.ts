import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  UseGuards,
} from "@nestjs/common";
import { LinkProcessorService } from "./link-processer.service";
import { BypassLinkDto } from "./dto/bypass-link.dto";
import { CaptchaGuard } from "src/captcha/captcha.guard";

@Controller("/bypass")
export class BypassController {
  constructor(private readonly service: LinkProcessorService) {}

  @UseGuards(CaptchaGuard)
  @Post("/")
  @HttpCode(200)
  async processLink(@Body() dto: BypassLinkDto) {
    const { url } = dto;
    const result = await this.service.process(new URL(url));

    return result;
  }

  @Get("/supported")
  getSupportedServices() {
    return this.service.getSupportedServices();
  }
}
