import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { SupportedHosts } from "src/unlocker/decorators/supported-hosts.decorator";
import { UnlockerResult, UnlockerService } from "../unlocker.type";

@Injectable()
@SupportedHosts(["cutyion.com"])
export class CutyionService implements UnlockerService {
  public readonly name = "Cutyion";

  async unlock(
    url: URL,
    metadata?: Record<string, unknown>,
  ): Promise<UnlockerResult> {
    return {
      type: "url",
      content: "",
    };
  }
}
