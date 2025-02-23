import { HttpService } from "@nestjs/axios";
import { decodeJwt } from "src/utils/decodeJwt";
import { CodexUtils } from "./codex.utils";
import { CodexApi } from "./codex-api.enum";
import {
  Stage,
  GetStagesResponse,
  InitStageResponse,
  StagePayload,
  ValidStageTokenResponse,
} from "./codex-response.types";
import { FastApiCurlProxyClient } from "src/fast-api-curl-proxy/fastapi-curl-proxy.client";
import { FastApiCurlClientFactory } from "src/fast-api-curl-proxy/fast-api-curl-client.factory";

export class CodexSession {
  private isInitialized = false;
  private stages: Array<Stage>;
  private client: FastApiCurlProxyClient;

  private static readonly HEADERS: Record<string, string | null> = {
    Host: "api.codex.lol",
    Origin: "https://mobile.codex.lol",
    Referer: "https://mobile.codex.lol/",
  };

  constructor(factory: FastApiCurlClientFactory, session: string) {
    if (typeof session !== "string") {
      throw new Error("Invalid Android session token");
    }

    this.client = factory.createClient({
      headers: {
        ...CodexSession.HEADERS,
        "Android-Session": session.trim(),
      },
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      throw new Error("Codex session is already initialized");
    }

    this.isInitialized = true;
    await this.getStages();
  }

  async getStages(): Promise<Array<Stage>> {
    this.ensureInitialized();

    if (this.stages) {
      return this.stages;
    }

    const { data } = await this.client.get<GetStagesResponse>({
      url: CodexApi.GET_STAGES,
    });

    this.stages = data.authenticated ? [] : data.stages;
    return this.stages;
  }

  async initiateStage(stageId: string): Promise<string> {
    this.ensureInitialized();

    const { data } = await this.client.post<InitStageResponse>({
      url: CodexApi.INITIATE_STAGE,
      data: { stageId },
    });

    return data.token;
  }

  async validateStage(initStageToken: string): Promise<string> {
    this.ensureInitialized();

    const payload = decodeJwt(initStageToken).payload as StagePayload;
    const taskReferrer = CodexUtils.getTaskReferrer(payload.link);

    const { data } = await this.client.post<ValidStageTokenResponse>({
      url: CodexApi.VALIDATE_STAGE,
      data: { token: initStageToken },
      headers: {
        "Task-Referrer": taskReferrer,
      },
    });

    return data.token;
  }

  async authenticate(stages: { uuid: string; token: string }[]): Promise<void> {
    this.ensureInitialized();

    await this.client.post({
      url: CodexApi.AUTHENTICATE,
      data: { tokens: stages },
    });
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error("Codex session is not initialized");
    }
  }
}
