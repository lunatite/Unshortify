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

export class CodexSession {
  private isInitialized = false;
  private stages: Array<Stage> | null;
  private androidSession: string | undefined = undefined;

  private static readonly HEADERS: Record<string, string | null> = {
    "Android-Session": null,
    Host: "api.codex.lol",
    Origin: "https://mobile.codex.lol",
    Referer: "https://mobile.codex.lol/",
  };

  constructor(private readonly httpService: HttpService) {}

  async initialize(androidSession: string): Promise<void> {
    if (this.isInitialized) {
      throw new Error("Codex session is already initialized");
    }
    if (typeof androidSession !== "string" || !androidSession.trim()) {
      throw new Error("Invalid Android session token");
    }

    this.androidSession = androidSession.trim();
    this.stages = await this.getStages();
    this.isInitialized = true;
  }

  async getStages(): Promise<Array<Stage>> {
    this.ensureInitialized();

    if (this.stages) {
      return this.stages;
    }

    const { data } = await this.httpService.axiosRef.get<GetStagesResponse>(
      CodexApi.GET_STAGES,
      {
        headers: {
          ...CodexSession.HEADERS,
          "Android-Session": this.androidSession,
        },
      },
    );

    return data.authenticated ? [] : data.stages;
  }

  async initiateStage(stageId: string): Promise<string> {
    this.ensureInitialized();

    const { data } = await this.httpService.axiosRef.post<InitStageResponse>(
      CodexApi.INITIATE_STAGE,
      { stageId },
      {
        headers: {
          ...CodexSession.HEADERS,
          "Android-Session": this.androidSession,
        },
      },
    );

    return data.token;
  }

  async validateStage(initStageToken: string): Promise<string> {
    this.ensureInitialized();

    const payload = decodeJwt(initStageToken).payload as StagePayload;
    const taskReferrer = CodexUtils.getTaskReferrer(payload.link);

    const { data } =
      await this.httpService.axiosRef.post<ValidStageTokenResponse>(
        CodexApi.VALIDATE_STAGE,
        { token: initStageToken },
        {
          headers: {
            ...CodexSession.HEADERS,
            "Android-Session": this.androidSession,
            "Task-Referrer": taskReferrer,
          },
        },
      );

    return data.token;
  }

  async authenticate(stages: { uuid: string; token: string }[]): Promise<void> {
    this.ensureInitialized();

    await this.httpService.axiosRef.post(
      CodexApi.AUTHENTICATE,
      { tokens: stages },
      {
        headers: {
          ...CodexSession.HEADERS,
          "Android-Session": this.androidSession,
        },
      },
    );
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error("Codex session is not initialized");
    }
  }
}
