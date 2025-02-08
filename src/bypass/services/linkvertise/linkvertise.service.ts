import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { LinkProcessorHandler } from "src/bypass/link-processor.types";
import { LinkvertiseSession } from "./linkvertise.session";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { wait } from "src/utils/wait";

@Injectable()
export class LinkvertiseService implements LinkProcessorHandler {
  public readonly name = "Linkvertise";
  private defaultWaitTime = 10;

  constructor(private readonly session: LinkvertiseSession) {}

  async resolve(url: URL) {
    const [_, userId, name] = url.pathname.split("/");

    if (!userId || !name) {
      throw new InvalidPathException("/{userId}/{name}");
    }

    const { accessToken } = await this.session.getDetailPageContent(
      userId,
      name,
    );
    const { targetToken, remainingWaitingTime } =
      await this.session.getCompleteDetailPageContent(
        userId,
        name,
        accessToken,
      );

    if (remainingWaitingTime) {
      if (remainingWaitingTime > this.defaultWaitTime) {
        await wait(1000 * this.defaultWaitTime + 500);
      } else {
        throw new InternalServerErrorException(
          `Cooldown in progress. Please wait ${remainingWaitingTime} seconds before trying again`,
        );
      }
    }

    const result = await this.session.getDetailPageTarget(
      userId,
      name,
      targetToken,
    );
    return result;
  }
}
