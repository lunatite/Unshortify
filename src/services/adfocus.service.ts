import { LinkShortenerService } from "src/common/types/link-shortener-service.type";

export class AdFocusService implements LinkShortenerService {
  public readonly name = "Adfoc.us";

  async bypass(url: URL) {
    return "";
  }
}
