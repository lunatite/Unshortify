import { Injectable } from "@nestjs/common";
import { LinkShortenerService } from "../link-shortener.types";

@Injectable()
export class LinkvertiseService implements LinkShortenerService {
  public readonly name = "Linkvertise";

  async bypass(url: URL) {
    return "";
  }
}
