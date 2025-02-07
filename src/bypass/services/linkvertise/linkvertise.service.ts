import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectBrowser } from "nestjs-puppeteer";
import { Browser } from "puppeteer";
import { LinkProcessorHandler } from "../../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { wait } from "src/utils/wait";
import { LinkvertiseSession } from "./linkvertise.session";

@Injectable()
export class LinkvertiseService implements LinkProcessorHandler {
  public readonly name = "Linkvertise";
  private readonly defaultWaitTime = 10;

  constructor(@InjectBrowser() private readonly browser: Browser) {}

  async resolve(url: URL) {
    const [_, userId, name] = url.pathname.split("/");

    if (!userId || !name) {
      throw new InvalidPathException("/{userId}/{name}");
    }

    const page = await this.browser.newPage();

    await page.authenticate({
      username: "pckOSz6eYw-res-any",
      password: "PC_2XevCp8y3yAR9cCl6",
    });

    await page.setBypassCSP(true);
    await page.goto("https://linkvertise.com/android-icon-192x192.png");

    const session = new LinkvertiseSession(page);
    await session.initialize();

    const { accessToken, isPremiumOnlyLink } =
      await session.getDetailPageContent(userId, name);

    if (isPremiumOnlyLink) {
      await session.close();
      throw new BadRequestException(
        "Link can only be accessed by premium users",
      );
    }

    const { targetToken, remainingWaitingTime } =
      await session.getCompleteDetailPageContent(userId, name, accessToken);

    if (remainingWaitingTime > this.defaultWaitTime) {
      await session.close();
      throw new InternalServerErrorException(
        `Cooldown in progress. Please wait ${remainingWaitingTime} seconds before trying again`,
      );
    }

    // // You must wait 10 seconds, or else you'll immediately have to wait for a 1-hour cooldown
    await wait(1000 * remainingWaitingTime + 500);

    const result = await session.getDetailPageTarget(userId, name, targetToken);
    await session.close();

    return result;
  }
}
