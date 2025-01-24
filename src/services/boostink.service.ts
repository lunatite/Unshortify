import { LinkShortenerService } from "src/common/types/link-shortener-service.type";

export class BoostInkService implements LinkShortenerService {
  public readonly name = "Boost.Ink";

  async bypass(url: URL) {
    return "";
  }
}
