import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { CacheModule } from "@nestjs/cache-manager";
import { createKeyv } from "@keyv/redis";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { HttpsProxyAgent } from "https-proxy-agent";
import { join } from "path";
import { BypassModule } from "./bypass/bypass.module";
import { validate } from "./env.validation";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true, // we will use Docker to load the env for us
      validate,
    }),
    {
      ...HttpModule.registerAsync({
        useFactory: (configService: ConfigService) => {
          const proxyUrl = configService.get("HTTP_PROXY");

          return {
            timeout: 5000,
            headers: {
              "User-Agent":
                "Mozilla/5.0 (X11; Linux x86_64; rv:135.0) Gecko/20100101 Firefox/135.0",
            },
            httpsAgent: proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined,
          };
        },
        inject: [ConfigService],
      }),
      global: true,
    },
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
