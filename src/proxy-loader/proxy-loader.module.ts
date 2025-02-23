import { DynamicModule, Module } from "@nestjs/common";
import { ProxyLoaderService } from "./proxy-loader.service";

export type ProxyLoaderModuleOptions = {
  filePath?: string;
  global?: boolean;
};

@Module({})
export class ProxyLoaderModule {
  static register(options: ProxyLoaderModuleOptions): DynamicModule {
    return {
      module: ProxyLoaderModule,
      global: options.global,
      providers: [
        {
          provide: "PROXY_FILE_PATH",
          useValue: options.filePath ?? "proxies.txt",
        },
        ProxyLoaderService,
      ],
      exports: [ProxyLoaderService],
    };
  }
}
