import { Module } from "@nestjs/common";
import { LinkShortenerModule } from "./link-shortener/link-shortener.module";

@Module({
  imports: [LinkShortenerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
