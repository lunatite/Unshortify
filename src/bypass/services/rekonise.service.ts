import { Injectable } from "@nestjs/common";
import axios from "axios";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";

@Injectable()
export class RekoniseService implements LinkProcessorHandler {
  public readonly name = "Rekonise";

  async resolve(url: URL) {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

    const id = url.pathname.slice(1, url.pathname.length);

    const { data } = await axios.get<{ url: string; date: string }>(
      `https://api.rekonise.com/social-unlocks/${id}`,
    );

    return data.url;
  }
}
