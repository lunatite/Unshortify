import { Module, Global } from "@nestjs/common";
import { HttpClientFactory } from "./http-client.factory";
import { ProxyProviderModule } from "../proxy-provider/proxy-provider.module";

@Global()
@Module({
  imports: [ProxyProviderModule],
  providers: [HttpClientFactory],
  exports: [HttpClientFactory],
})
export class HttpClientModule {}
