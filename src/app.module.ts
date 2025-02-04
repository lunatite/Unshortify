import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { CacheModule } from "@nestjs/cache-manager";
import { createKeyv } from "@keyv/redis";
import { join } from "path";
import { BypassModule } from "./bypass/bypass.module";
// import { ProxyProviderModule } from "./proxy-provider/proxy-provider.module";
import { HttpClientModule } from "./http-client/http-client.module";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "client"),
    }),
    CacheModule.register({
      isGlobal: true,
      stores: [createKeyv("redis://localhost:6379")],
    }),
    HttpClientModule.register({
      proxy:
        "http://pckOSz6eYw-res_sc-us_california_losangeles-sid-72188594:PC_2XevCp8y3yAR9cCl6@proxy-us.proxy-cheap.com:5959",
    }),
    BypassModule,
    // ProxyProviderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
