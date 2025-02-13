import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";

@Injectable()
export class PasterSoService implements LinkProcessorHandler {
  public readonly name = "PasterSo";

  constructor(private readonly httpService: HttpService) {}

  async resolve(url: URL) {
    return "";
  }
}
