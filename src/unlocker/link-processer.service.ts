import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { ConfigService } from "@nestjs/config";
import { ModuleRef } from "@nestjs/core";
import { UnlockerService } from "./services/unlocker.type";
import { HostNotSupported } from "./errors/host-not-supported.exception";
import { UnlockerModule } from "./unlocker.module";

@Injectable()
export class LinkProcessorService implements OnModuleInit {
  private readonly serviceMap: Map<string, UnlockerService>;
  private supportedServices: string[];
  private readonly isCacheEnabled: boolean;
  private readonly cacheTTL: number;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    configService: ConfigService,
    private readonly moduleRef: ModuleRef,
  ) {
    this.serviceMap = new Map();

    this.isCacheEnabled = configService.get<boolean>("CACHE_ENABLED") ?? true;
    this.cacheTTL = configService.getOrThrow<number>("CACHE_TTL");
  }

  onModuleInit() {
    const providers = Reflect.getMetadata("providers", UnlockerModule);

    providers.forEach((provider) => {
      const hostnames = (Reflect.getMetadata("supportedHosts", provider) ||
        []) as string[];

      const handler = this.moduleRef.get(provider);

      hostnames.forEach((hostname) => {
        this.serviceMap.set(hostname, handler);
      });
    });

    this.supportedServices = Array.from(this.serviceMap.keys());
  }

  async process(url: URL) {
    const unlockerService = this.serviceMap.get(url.hostname);

    if (!unlockerService) {
      throw new HostNotSupported(url);
    }

    if (this.isCacheEnabled) {
      const cachedResult = await this.cache.get(url.href);
      if (cachedResult !== null) {
        return { name: unlockerService.name, result: cachedResult };
      }
    }

    const result = await unlockerService.unlock(url);

    if (this.isCacheEnabled) {
      await this.cache.set(url.href, result.content, this.cacheTTL * 1000);
    }

    return { name: unlockerService.name, ...result };
  }

  async getSupportedServices() {
    return this.supportedServices;
  }
}
