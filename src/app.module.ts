import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { CacheModule } from "@nestjs/cache-manager";
import { createKeyv } from "@keyv/redis";
import { join } from "path";
import { BypassModule } from "./bypass/bypass.module";
import { ProxyProviderModule } from "./proxy-provider/proxy-provider.module";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "client"),
    }),
    CacheModule.register({
      isGlobal: true,
      stores: [createKeyv("redis://localhost:6379")],
    }),
    BypassModule,
    ProxyProviderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
