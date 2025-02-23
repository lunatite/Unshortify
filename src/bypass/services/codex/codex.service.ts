import { Injectable } from "@nestjs/common";
import { wait } from "src/utils/wait";
import { CodexSession } from "./codex.session";
import { LinkProcessorHandler } from "../../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { SupportedHosts } from "src/bypass/decorators/supported-hosts.decorator";
import { FastApiCurlClientFactory } from "src/fast-api-curl-proxy/fast-api-curl-client.factory";

@Injectable()
@SupportedHosts(["mobile.codex.lol"])
export class CodexService implements LinkProcessorHandler {
  public readonly name = "Codex";

  constructor(
    private readonly fastApiClientFactory: FastApiCurlClientFactory,
  ) {}

  async resolve(url: URL) {
    const androidSession = url.searchParams.get("token");

    if (!androidSession) {
      throw new InvalidPathException("?token={androidSession}");
    }

    const codexSession = new CodexSession(
      this.fastApiClientFactory,
      androidSession,
    );

    await codexSession.initialize();

    const stages = await codexSession.getStages();

    if (stages.length === 0) {
      return "You have been authenticated";
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

    return "You have been authenticated";
  }
}
