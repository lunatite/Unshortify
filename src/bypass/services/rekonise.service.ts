import { Injectable } from "@nestjs/common";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { HttpClient } from "src/http-client/http-client";

@Injectable()
export class RekoniseService implements LinkProcessorHandler {
  public readonly name = "Rekonise";

  constructor(private readonly httpClient: HttpClient) {}

  private async fetchBypassedLink(id: string) {
    const { data } = await this.httpClient.get<{ url: string; date: string }>(
      `https://api.rekonise.com/social-unlocks/${id}`,
    );

    return data.url;
  }

  async resolve(url: URL) {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

    const id = url.pathname.slice(1, url.pathname.length);
    const bypassedLink = await this.fetchBypassedLink(id);
    return bypassedLink;
  }
}
