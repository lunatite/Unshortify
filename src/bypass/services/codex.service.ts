import { HttpService } from "@nestjs/axios";
import { BadRequestException, Injectable } from "@nestjs/common";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { decodeJwt } from "src/utils/decodeJwt";
import { wait } from "src/utils/wait";

type Stage = {
  uuid: string;
  name: "loot-link" | "loot-links" | "linkvertise";
  title: string;
  description: string;
};

type GetStagesResponse = {
  success: boolean;
  streak: boolean;
  authenticated?: boolean;
  stages?: Array<Stage>;
};

type InitiateStageResponse = {
  success: boolean;
  token?: string;
};

type InitiateStageJwtPayload = {
  stage: string;
  hwid: string;
  id: string;
  link: string;
  status: number;
  iat: number;
  exp: number;
};

type ValidateStageResponse = {
  success: boolean;
  token: string;
};

type AuthenticateStage = {
  token: string;
  uuid: string;
};

@Injectable()
export class CodexService implements LinkProcessorHandler {
  public readonly name = "Codex";

  constructor(private readonly httpService: HttpService) {}

  private async getStages(androidSession: string) {
    const response = await this.httpService.axiosRef.get<GetStagesResponse>(
      "https://api.codex.lol/v1/stage/stages",
      {
        headers: {
          "Android-Session": androidSession,
        },
      },
    );

    const data = response.data;

    console.log(data);

    if (data.success) {
      if (data.authenticated) {
        return [];
      }

      return data.stages;
    }

    throw new BadRequestException("Failed to get stages");
  }

  private async initiateStage(stageId: string, androidSession: string) {
    const response =
      await this.httpService.axiosRef.post<InitiateStageResponse>(
        "https://api.codex.lol/v1/stage/initiate",
        {
          stageId,
        },
        {
          headers: {
            "Android-Session": androidSession,
            Host: "api.codex.lol",
            Origin: "https://mobile.codex.lol",
            Referer: "https://mobile.codex.lol/",
          },
        },
      );

    if (!response.data.success) {
      throw new Error("cannot initiate stage...");
    }

    return response.data.token;
  }

  private async validateStage(
    stageToken: string,
    referrer: string,
    androidSession: string,
  ) {
    const { data } =
      await this.httpService.axiosRef.post<ValidateStageResponse>(
        "https://api.codex.lol/v1/stage/validate",
        {
          token: stageToken,
        },
        {
          headers: {
            "Android-Session": androidSession,
            Host: "api.codex.lol",
            Origin: "https://mobile.codex.lol",
            Referer: "https://mobile.codex.lol/",
            "Task-Referrer": referrer,
          },
        },
      );

    if (!data.success) {
      throw new BadRequestException("unable to unvalidate stage");
    }

    return data.token;
  }

  private async authenticate(
    tokens: Array<AuthenticateStage>,
    androidSession: string,
  ) {
    const response = await this.httpService.axiosRef.post(
      "https://api.codex.lol/v1/stage/authenticate",
      { tokens },
      {
        headers: {
          "Android-Session": androidSession,
          Host: "api.codex.lol",
          Origin: "https://mobile.codex.lol",
          Referer: "https://mobile.codex.lol/",
        },
      },
    );
  }

  async resolve(url: URL) {
    const androidSession = url.searchParams.get("token");

    if (!androidSession) {
      throw new BadRequestException("can't extract token from params");
    }

    const stages = await this.getStages(androidSession);

    if (stages.length === 0) {
      return "Already authenticated";
    }

    const authenticatedStages: Array<AuthenticateStage> = [];

    await Promise.all(
      stages.map(async (stage, index) => {
        const initiateStageToken = await this.initiateStage(
          stage.uuid,
          androidSession,
        );

        const decodedInitiateStageToken = decodeJwt(initiateStageToken)
          .payload as InitiateStageJwtPayload;

        let referrer;

        const link = decodedInitiateStageToken.link;

        if (link.includes("loot-links")) {
          referrer = "https://loot-links.com/";
        } else if (link.includes("loot-link")) {
          referrer = "https://loot-link.com/";
        } else {
          referrer = "https://linkvertise.com/";
        }

        await wait(5500 + index * 5000);

        const validateStageToken = await this.validateStage(
          initiateStageToken,
          referrer,
          androidSession,
        );

        authenticatedStages.push({
          token: validateStageToken,
          uuid: stage.uuid,
        });
      }),
    );

    console.log(authenticatedStages);

    await this.authenticate(authenticatedStages, androidSession);

    return "Authenticated";
  }
}
