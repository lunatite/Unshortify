import { Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { createKeyv } from "@keyv/redis";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SentryModule } from "@sentry/nestjs/setup";
import { HttpsProxyAgent } from "https-proxy-agent";
import * as path from "path";
import { BypassModule } from "./bypass/bypass.module";
import { validate } from "./env.validation";
import { FastApiCurlProxyModule } from "./fast-api-curl-proxy/fastapi-curl-proxy.module";
import { CaptchaModule } from "./captcha/captcha.module";
import { AppController } from "./app.controller";
import { CaptchaSolverModule } from "./captcha-solver/captcha-solver.module";
import { ProxyLoaderModule } from "./proxy-loader/proxy-loader.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true, // we will use Docker to load the env for us
      validate,
    }),
    ProxyLoaderModule.register({
      filePath: path.join(__dirname, "../proxies.txt"),
    }),
    SentryModule.forRoot(),
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
    FastApiCurlProxyModule,
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
    CaptchaModule,
    CaptchaSolverModule,
    BypassModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
