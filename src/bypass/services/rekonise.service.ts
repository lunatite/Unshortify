import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { SupportedHosts } from "../decorators/supported-hosts.decorator";

@Injectable()
@SupportedHosts(["rekonise.com"])
export class RekoniseService implements LinkProcessorHandler {
  public readonly name = "Rekonise";
  private static readonly UNLOCK_URL =
    "https://api.rekonise.com/social-unlocks";

  constructor(private readonly httpService: HttpService) {}

  private async fetchShortenedLink(id: string) {
    const { data } = await this.httpService.axiosRef.get<{
      url: string;
      date: string;
    }>(`${RekoniseService.UNLOCK_URL}/${id}`);

    return data.url;
  }

  async resolve(url: URL) {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

    const id = url.pathname.slice(1, url.pathname.length);
    const shortenedLink = await this.fetchShortenedLink(id);
    return shortenedLink;
  }
}
