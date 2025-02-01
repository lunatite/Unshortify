import { Injectable } from "@nestjs/common";
import axios from "axios";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";

@Injectable()
export class Sub2UnlockService implements LinkProcessorHandler {
  public readonly name = "Sub2Unlock";

  async resolve(url: URL) {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

    const id = url.pathname.slice(1, url.pathname.length);

    return id;
  }
}
