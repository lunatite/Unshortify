import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { LinkProcessorHandler } from "../link-processor.types";

@Injectable()
export class CodexService implements LinkProcessorHandler {
  public readonly name = "Codex";

  constructor(private readonly httpService: HttpService) {}

  async resolve(url: URL) {
    return "";
  }
}
