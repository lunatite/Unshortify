import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  CapMonsterCloudClientFactory,
  ClientOptions,
  TurnstileRequest,
} from "@zennolab_com/capmonstercloud-client";
import { CapMonsterCloudClient } from "@zennolab_com/capmonstercloud-client/dist/CapMonsterCloudClient";
import { CaptchaSolver } from "../captcha-solver.interface";

export interface TurnstileRequestParams {
  websiteURL: string;
  websiteKey: string;
  proxyAddress?: string;
  htmlPageBase64?: string;
  userAgent?: string;
}

@Injectable()
export class CapMonsterSolverService implements CaptchaSolver {
  private readonly cmcClient: CapMonsterCloudClient;

  constructor(configService: ConfigService) {
    const clientKey = configService.get<string>("CAPMONSTER_CLIENT_KEY");
    const options = new ClientOptions({ clientKey });
    this.cmcClient = CapMonsterCloudClientFactory.Create(options);
  }

  async getBalance() {
    const response = await this.cmcClient.getBalance();
    return response.balance;
  }

  async solveTurnstileCfClearance(params: TurnstileRequestParams) {
    const request = new TurnstileRequest({
      cloudflareTaskType: "cf_clearance",
      websiteKey: params.websiteKey,
      websiteURL: params.websiteURL,
      proxyAddress: undefined,
      proxyType: undefined,
      proxyPort: undefined,
      htmlPageBase64: params.htmlPageBase64,
      userAgent: params.userAgent,
    });

    if (params.proxyAddress) {
      const parsedProxy = parseProxyAddress(params.proxyAddress);
      request.proxyAddress = parsedProxy.host;
      request.proxyType = parsedProxy.protocol;
      request.proxyLogin = parsedProxy.username;
      request.proxyPassword = parsedProxy.password;
      request.proxyPort = parsedProxy.port;
    }

    const response = await this.cmcClient.Solve(request);

    if (response.error) {
      throw new Error(`CAPTCHA service error : ${response.error}`);
    }

    return response.solution.token;
  }
}
