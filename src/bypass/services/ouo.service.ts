import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { LinkProcessorHandler } from "../link-processor.types";

@Injectable()
export class OuoService implements LinkProcessorHandler {
  public readonly name = "Ouo";

  constructor(private readonly httpService: HttpService) {}

  async resolve(url: URL): Promise<string> {
    return "";
  }
}
