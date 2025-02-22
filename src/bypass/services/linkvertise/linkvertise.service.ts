import { Injectable } from "@nestjs/common";
import { SupportedHosts } from "src/bypass/decorators/supported-hosts.decorator";
import { LinkProcessorHandler } from "src/bypass/link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { LinkvertiseSession } from "./linkvertise.session";
import { HttpCurlCuffService } from "src/http-curl-cuff/http-curl-cuff.service";
import { wait } from "src/utils/wait";

@Injectable()
@SupportedHosts(["linkvertise.com"])
export class LinkvertiseService implements LinkProcessorHandler {
  public readonly name = "Linkvertise";

  private static readonly DEFAULT_WAIT_TIME_IN_SECS = 10;

  constructor(private readonly httpService: HttpCurlCuffService) {}

  async resolve(url: URL) {
    const paths = url.pathname.split("/");

    if (paths.length !== 3) {
      throw new InvalidPathException("{name}/${id}");
    }

    const userId = paths[1];
    const name = paths[2];

    const session = new LinkvertiseSession(this.httpService);
    await session.initialize();

    const { isPremiumLink, premiumSubscriptionActive, accessToken } =
      await session.getDetailPageContent(userId, name);

    if (isPremiumLink && !premiumSubscriptionActive) {
      throw new Error("cannot be access premium link only");
    }

    const { hasLongPaywallDuration, remainingWaitingTime, targetToken } =
      await session.getCompleteDetailPageContent(userId, name, accessToken);

    if (hasLongPaywallDuration) {
      throw new Error(
        `Remaining waiting time of ${remainingWaitingTime} seconds exceed the default limit of ${LinkvertiseService.DEFAULT_WAIT_TIME_IN_SECS} seconds`,
      );
    }

    await wait(LinkvertiseService.DEFAULT_WAIT_TIME_IN_SECS * 1000);

    const unshortenedLink = await session.getDetailPageTarget(
      userId,
      name,
      targetToken,
    );

    return unshortenedLink;
  }
}
