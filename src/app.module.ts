import { Module } from "@nestjs/common";
import { BypassModule } from "./bypass/bypass.module";

@Module({
  imports: [BypassModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
