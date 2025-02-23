import { Global, Module } from "@nestjs/common";
import { FastApiCurlProxyService } from "./fastapi-curl-proxy.service";

@Global()
@Module({
  providers: [FastApiCurlProxyService],
  exports: [FastApiCurlProxyService],
})
export class FastApiCurlProxyModule {}
