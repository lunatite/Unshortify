import { Injectable, Inject, Logger, OnModuleInit } from "@nestjs/common";
import { readFile } from "fs/promises";
import { isValidProxy } from "src/utils/isValidProxy";

@Injectable()
export class ProxyLoaderService implements OnModuleInit {
  private proxies: string[];
  private readonly logger = new Logger(ProxyLoaderService.name);

  constructor(
    @Inject("PROXY_FILE_PATH") private readonly proxyFilePath: string,
  ) {}

  async onModuleInit() {
    await this.loadProxies();
  }

  private async loadProxies() {
    try {
      const data = await readFile(this.proxyFilePath, "utf-8");

      this.proxies = data
        .split("\n")
        .map((proxy) => proxy.trim())
        .filter((proxy) => isValidProxy(proxy));

      this.logger.log(
        `✅ Loaded ${this.proxies.length} proxies from ${this.proxyFilePath}`,
      );
    } catch (error) {
      this.logger.error("❌  Error loading proxies: ", error.message);
    }
  }

  getRandomProxy(): string | null {
    if (this.proxies.length === 0) {
      return null;
    }

    return this.proxies[Math.floor(Math.random() * this.proxies.length)];
  }
}
