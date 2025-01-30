import { Controller, Post, Body, BadRequestException } from "@nestjs/common";
import { BypassResolver } from "./bypass.resolver";
import { BypassLinkDto } from "./dto/bypass-link.dto";

@Controller("/bypass")
export class BypassController {
  constructor(private readonly factory: BypassResolver) {}

  @Post("/")
  async getBypassedLink(@Body() linkShortenerDto: BypassLinkDto) {
    try {
      const { url } = linkShortenerDto;
      const result = await this.factory.getBypassedLink(new URL(url));

      return result;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message || "An error occurred");
    }
  }
}
