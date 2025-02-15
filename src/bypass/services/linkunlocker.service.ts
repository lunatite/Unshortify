import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";

@Injectable()
export class LinkUnlockerService implements LinkProcessorHandler {
  public readonly name = "LinkUnlocker";

  constructor(private readonly httpService: HttpService) {}

  async resolve(url: URL) {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

    return "";
  }
}
