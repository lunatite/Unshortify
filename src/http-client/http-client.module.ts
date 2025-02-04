import { Module, Global } from "@nestjs/common";
import { HttpClient } from "./http-client";
import { isValidProxy } from "src/utils/isValidProxy";

export interface HttpClientOptions {
  proxy?: string;
}

@Global()
@Module({})
export class HttpClientModule {
  static register(options?: HttpClientOptions) {
    if (options?.proxy && !isValidProxy(options.proxy)) {
      throw new Error(`Invalid proxy format: ${options.proxy}`);
    }

    return {
      module: HttpClientModule,
      providers: [
        {
          provide: HttpClient,
          useFactory: () => new HttpClient(options?.proxy),
        },
      ],
      exports: [HttpClient],
      global: true,
    };
  }
}
