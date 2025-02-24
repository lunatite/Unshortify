import { Injectable } from "@nestjs/common";
import { LinkvertiseSession } from "./linkvertise.session";
import { SupportedHosts } from "src/unlocker/decorators/supported-hosts.decorator";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { FastApiCurlClientFactory } from "src/fast-api-curl-proxy/fast-api-curl-client.factory";
import { wait } from "src/utils/wait";
import { UnlockerResult, UnlockerService } from "../../unlocker.type";

@Injectable()
@SupportedHosts(["linkvertise.com"])
export class LinkvertiseService implements UnlockerService {
  public readonly name = "Linkvertise";

  private static readonly DEFAULT_WAIT_TIME_IN_SECS = 10;

  constructor(
    private readonly fastApiCurlClientFactory: FastApiCurlClientFactory,
  ) {}

  async unlock(url: URL): Promise<UnlockerResult> {
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

    const bypassedLink = await session.getDetailPageTarget(
      userId,
      name,
      targetToken,
    );

    return {
      type: "url",
      content: bypassedLink,
    };
  }
}
