import { Injectable } from "@nestjs/common";
import { ProxyLoaderService } from "src/proxy-loader/proxy-loader.service";
import {
  FastApiCurlProxyClient,
  FastApiCurlProxyClientOptions,
} from "./fastapi-curl-proxy.client";

@Injectable()
export class FastApiCurlClientFactory {
  constructor(private readonly proxyLoader: ProxyLoaderService) {}

  createClient(options?: Omit<FastApiCurlProxyClientOptions, "proxies">) {
    return new FastApiCurlProxyClient({
      ...options,
      proxies: {
        all: this.proxyLoader.getRandomProxy(),
      },
    });
  }
}
