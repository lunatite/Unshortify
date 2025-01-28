import { Controller, Post, Body, BadRequestException } from "@nestjs/common";
import { LinkShortenerFactory } from "./link-shortener.factory";
import { LinkShortenerDto } from "./dto/link-shortener.dto";

@Controller("/link-shortener")
export class LinkShortenerController {
  constructor(private readonly factory: LinkShortenerFactory) {}

  @Post("/")
  async getBypassedLink(@Body() linkShortenerDto: LinkShortenerDto) {
    try {
      const { url } = linkShortenerDto;
      const result = await this.factory.getBypassedLink(url);

      return result;
    } catch (error) {
      throw new BadRequestException(error.message || "An error occurred");
    }
  }
}
