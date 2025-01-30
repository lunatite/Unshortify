import { Controller, Post, Body, BadRequestException } from "@nestjs/common";
import { LinkShortenerFactory } from "./bypass.factory";
import { LinkShortenerDto } from "./dto/link-shortener.dto";

@Controller("/link-shortener")
export class BypassController {
  constructor(private readonly factory: LinkShortenerFactory) {}

  @Post("/")
  async getBypassedLink(@Body() linkShortenerDto: LinkShortenerDto) {
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
