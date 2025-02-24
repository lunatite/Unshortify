import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { SupportedHosts } from "src/unlocker/decorators/supported-hosts.decorator";
import { UnlockerResult, UnlockerService } from "../unlocker.type";

@Injectable()
@SupportedHosts(["rekonise.com"])
export class RekoniseService implements UnlockerService {
  public readonly name = "Rekonise";
  private static readonly UNLOCK_URL =
    "https://api.rekonise.com/social-unlocks";

  constructor(private readonly httpService: HttpService) {}

  private async fetchUnlockedLink(id: string) {
    const { data } = await this.httpService.axiosRef.get<{
      url: string;
      date: string;
    }>(`${RekoniseService.UNLOCK_URL}/${id}`);

    return data.url;
  }

  async unlock(url: URL): Promise<UnlockerResult> {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

    const id = url.pathname.slice(1, url.pathname.length);
    const unlockedLink = await this.fetchUnlockedLink(id);

    return {
      type: "url",
      content: unlockedLink,
    };
  }
}
