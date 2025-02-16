import { HttpService } from "@nestjs/axios";
import { BadRequestException, Injectable } from "@nestjs/common";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";

type Stage = {
  uuid: string;
  name: "loot-link" | "loot-links" | "linkvertise";
  title: string;
  description: string;
};

type GetStagesResponse = {
  success: boolean;
  streak: boolean;
  stages?: Array<Stage>;
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

    return response.data;
  }

  async resolve(url: URL) {
    const androidSession = url.searchParams.get("token");

    if (!androidSession) {
      throw new BadRequestException("can't extract token from params");
    }

    const stages = await this.getStages(androidSession);

    console.log(stages);

    return "";
  }
}
