// import { Logger, Module, OnModuleInit } from "@nestjs/common";
// import * as path from "path";
// import { readFileSync } from "fs";
// import { isValidProxy } from "src/utils/isValidProxy";
// import { ProxyProviderService } from "./proxy-provider.service";

// @Module({
//   providers: [ProxyProviderService],
//   exports: [ProxyProviderService],
// })
// export class ProxyProviderModule implements OnModuleInit {
//   private readonly logger = new Logger(ProxyProviderModule.name);

//   constructor(private readonly service: ProxyProviderService) {}

//   onModuleInit() {
//     this.loadProxies();
//   }

//   private loadProxies() {
//     try {
//       const filePath = path.join(__dirname, "..", "..", "proxies.txt");
//       const data = readFileSync(filePath, "utf-8");

//       const proxies = data
//         .split("\n")
//         .map((line) => line.trim())
//         .filter((line) => line !== "" && isValidProxy(line));

//       this.logger.log(`Loaded ${proxies.length} valid proxies`);
//       this.service.setProxies(proxies);
//     } catch (error) {
//       this.logger.error(`Error loading proxies file`, error.stack);
//     }
//   }
// }
