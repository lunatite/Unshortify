import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { CacheModule } from "@nestjs/cache-manager";
import { createKeyv } from "@keyv/redis";
import { HttpModule } from "@nestjs/axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { ConfigModule } from "@nestjs/config";
import { join } from "path";
import { BypassModule } from "./bypass/bypass.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true, // we will use Docker to load the env for us
    }),
    HttpModule.register({
      global: true,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64; rv:135.0) Gecko/20100101 Firefox/135.0",
      },
      timeout: 5000,
      httpsAgent: new HttpsProxyAgent(
        "http://pckOSz6eYw-resfix-us-nnid-0:PC_2XevCp8y3yAR9cCl6@proxy-us.proxy-cheap.com:5959",
      ),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "client"),
    }),
    CacheModule.register({
      isGlobal: true,
      stores: [createKeyv("redis://localhost:6379")],
    }),
    BypassModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
