import { Controller, Post, Body, BadRequestException } from "@nestjs/common";
import { LinkProcessorService } from "./link-processer.service";
import { BypassLinkDto } from "./dto/bypass-link.dto";

@Controller("/bypass")
export class BypassController {
  constructor(private readonly service: LinkProcessorService) {}

  @Post("/")
  async processLink(@Body() dto: BypassLinkDto) {
    const { url } = dto;
    const result = await this.service.process(new URL(url));

    return result;
  }
}
