import { LinkShortenerService } from "src/common/types/link-shortener-service.type";

export class MBoostMeService implements LinkShortenerService {
  public readonly name: "MBoost.me";

  async bypass(url: URL) {
    return "";
  }
}
