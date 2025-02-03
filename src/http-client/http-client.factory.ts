import { Injectable } from "@nestjs/common";
import { HttpClient } from "./http-client";
import { ProxyProviderService } from "src/proxy-provider/proxy-provider.service";

@Injectable()
export class HttpClientFactory {
  constructor(private readonly proxyProvider: ProxyProviderService) {}

  createClient(): HttpClient {
    const proxy = this.proxyProvider.getRandomProxy();
    console.log(proxy);

    return new HttpClient();
  }
}
