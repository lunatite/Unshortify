import { Global, Module } from "@nestjs/common";
import { FastApiCurlClientFactory } from "./fast-api-curl-client.factory";

@Global()
@Module({
  providers: [FastApiCurlClientFactory],
  exports: [FastApiCurlClientFactory],
})
export class FastApiCurlClientFactoryModule {}
