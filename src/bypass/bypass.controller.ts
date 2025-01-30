import { Controller, Post, Body, BadRequestException } from "@nestjs/common";
import { LinkProcessorService } from "./link-processer.service";
import { BypassLinkDto } from "./dto/bypass-link.dto";

@Controller("/bypass")
export class BypassController {
  constructor(private readonly factory: LinkProcessorService) {}

  @Post("/")
  async getBypassedLink(@Body() linkShortenerDto: BypassLinkDto) {
    try {
      const { url } = linkShortenerDto;
      const result = await this.factory.process(new URL(url));

      return result;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message || "An error occurred");
    }
  }
}
