import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { BypassModule } from "./bypass/bypass.module";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "client"),
    }),
    BypassModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
