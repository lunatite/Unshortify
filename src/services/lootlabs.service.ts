import { LinkShortenerService } from "src/common/types/link-shortener-service.type";

export class LootLabsService implements LinkShortenerService {
  public readonly name = "Lootlabs.gg";

  async bypass(url: URL) {
    return "";
  }
}
