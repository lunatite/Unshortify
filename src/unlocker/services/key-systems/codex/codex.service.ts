import { Injectable } from "@nestjs/common";
import { wait } from "src/utils/wait";
import { CodexSession } from "./codex.session";
import { UnlockerResult, UnlockerService } from "../../unlocker.type";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { SupportedHosts } from "src/unlocker/decorators/supported-hosts.decorator";
import { FastApiCurlClientFactory } from "src/fast-api-curl-proxy/fast-api-curl-client.factory";

@Injectable()
@SupportedHosts(["mobile.codex.lol"])
export class CodexService implements UnlockerService {
  public readonly name = "Codex";

  constructor(private readonly httpClientFactory: FastApiCurlClientFactory) {}

  async unlock(url: URL): Promise<UnlockerResult> {
    const androidSession = url.searchParams.get("token");

    if (!androidSession) {
      throw new InvalidPathException("?token={androidSession}");
    }

    const codexSession = new CodexSession(
      this.httpClientFactory,
      androidSession,
    );

    await codexSession.initialize();

    const stages = await codexSession.getStages();

    if (stages.length === 0) {
      return {
        type: "whitelist",
        content: "You are already authenticated",
      };
    }

    const validStages: Array<{ token: string; uuid: string }> = [];

    await Promise.all(
      stages.map(async (stage, index) => {
        const initStageToken = await codexSession.initiateStage(stage.uuid);

        await wait((index + 1) * 10000);

        const validStageToken =
          await codexSession.validateStage(initStageToken);

        validStages.push({
          token: validStageToken,
          uuid: stage.uuid,
        });
      }),
    );

    await codexSession.authenticate(validStages);

    return {
      type: "whitelist",
      content: "You have been authenticated",
    };
  }
}
