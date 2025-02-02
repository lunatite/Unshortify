import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { CacheModule } from "@nestjs/cache-manager";
// import { createKeyv } from "@keyv/redis";
import { join } from "path";
import { BypassModule } from "./bypass/bypass.module";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "client"),
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    BypassModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
