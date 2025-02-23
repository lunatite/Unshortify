import { Injectable } from "@nestjs/common";
import { LinkvertiseSession } from "./linkvertise.session";
import { SupportedHosts } from "src/bypass/decorators/supported-hosts.decorator";
import { LinkProcessorHandler } from "src/bypass/link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { FastApiCurlClientFactory } from "src/fast-api-curl-proxy/fast-api-curl-client.factory";
import { wait } from "src/utils/wait";

@Injectable()
@SupportedHosts(["linkvertise.com"])
export class LinkvertiseService implements LinkProcessorHandler {
  public readonly name = "Linkvertise";

  private static readonly DEFAULT_WAIT_TIME_IN_SECS = 10;

  constructor(
    private readonly fastApiCurlClientFactory: FastApiCurlClientFactory,
  ) {}

  async resolve(url: URL) {
    const paths = url.pathname.split("/");

    if (paths.length !== 3) {
      throw new InvalidPathException("{name}/${id}");
    }

    const userId = paths[1];
    const name = paths[2];

    const session = new LinkvertiseSession(this.fastApiCurlClientFactory);
    await session.initialize();

    const { isPremiumLink, premiumSubscriptionActive, accessToken } =
      await session.getDetailPageContent(userId, name);

    if (isPremiumLink && !premiumSubscriptionActive) {
      throw new Error("This link is only avaliable to premium users");
    }

    await wait(3000);

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
