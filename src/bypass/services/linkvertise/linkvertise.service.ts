import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { HttpClient } from "src/http-client/http-client";
import { LinkProcessorHandler } from "../../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { wait } from "src/utils/wait";
import { LinkvertiseSession } from "./linkvertise.session";

@Injectable()
export class LinkvertiseService implements LinkProcessorHandler {
  public readonly name = "Linkvertise";
  private readonly defaultWaitTime = 10;

  constructor(private readonly httpClient: HttpClient) {}

  async resolve(url: URL) {
    const [_, userId, name] = url.pathname.split("/");

    if (!userId || !name) {
      throw new InvalidPathException("/{userId}/{name}");
    }

    const session = new LinkvertiseSession(this.httpClient);
    await session.initialize();

    const detailPageContent = await session.getDetailPageContent(userId, name);

    if (detailPageContent.isPremiumOnlyLink) {
      throw new BadRequestException(
        "Link can only be accessed by premium users",
      );
    }

    const { targetToken, remainingWaitingTime } =
      await session.getCompleteDetailPageContent(
        userId,
        name,
        detailPageContent.accessToken,
      );

    if (remainingWaitingTime > this.defaultWaitTime) {
      throw new InternalServerErrorException(
        "Cooldown in progress. Please wait before trying again",
      );
    }

    // You must wait 10 seconds, or else you'll immediately have to wait for a 1-hour cooldown
    await wait(1000 * remainingWaitingTime + 500);

    const result = await session.getDetailPageTarget(userId, name, targetToken);

    return result;
  }
}
