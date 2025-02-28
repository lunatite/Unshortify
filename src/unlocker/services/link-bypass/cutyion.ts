import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { SupportedHosts } from "src/unlocker/decorators/supported-hosts.decorator";
import { UnlockerResult, UnlockerService } from "../unlocker.type";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";

@Injectable()
@SupportedHosts(["cutyion.com"])
export class CutyionService implements UnlockerService {
  public readonly name = "Cutyion";
  public static readonly BASE_URL = "https://cutyion.com/";

  async unlock(
    url: URL,
    metadata?: Record<string, unknown>,
  ): Promise<UnlockerResult> {
    const parts = url.pathname.split("/").filter(Boolean);

    if (parts.length !== 1) {
      throw new InvalidPathException("/{id}");
    }

    const id = parts[0];

    return {
      type: "url",
      content: id,
    };
  }
}
