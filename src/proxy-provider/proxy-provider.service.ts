import { Injectable } from "@nestjs/common";

@Injectable()
export class ProxyProviderService {
  private proxies: string[] = [];

  setProxies(proxies: string[]): void {
    this.proxies = proxies;
  }

  getRandomProxy() {
    if (this.proxies.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * this.proxies.length);
    return this.proxies[randomIndex];
  }
}
