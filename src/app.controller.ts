import { Body, Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { BypassUrlDto } from "./bypass-url.dto";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Body() dto: BypassUrlDto) {
    return this.appService.getHello(dto.url);
  }
}
