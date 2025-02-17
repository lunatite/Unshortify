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
import { HttpCurlCuffModule } from "./http-curl-cuff/http-curl-cuff.module";

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
            httpsAgent: proxyUrl
              ? new HttpsProxyAgent(
                  "http://pckOSz6eYw-res-any-sid-36397429:PC_2XevCp8y3yAR9cCl6@proxy-us.proxy-cheap.com:5959",
                )
              : undefined,
          };
        },
        inject: [ConfigService],
      }),
      global: true,
    },
    HttpCurlCuffModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "client"),
    }),
    CacheModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const redisHost = configService.getOrThrow("REDIS_HOST");
        const redisPort = configService.getOrThrow("REDIS_PORT");
        const redisUsername = configService.get("REDIS_USERNAME");
        const redisPassword = configService.get("REDIS_PASSWORD");

        return {
          stores: [
            createKeyv({
              socket: {
                host: redisHost,
                port: redisPort,
              },
              username: redisUsername,
              password: redisPassword,
            }),
          ],
        };
      },
      isGlobal: true,
      inject: [ConfigService],
    }),
    BypassModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
