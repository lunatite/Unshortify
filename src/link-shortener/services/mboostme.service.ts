import axios from "axios";
import { LinkShortenerService } from "../link-shortener.types";

export class MBoostMeService implements LinkShortenerService {
  public readonly name = "MBoost.me";
  private readonly targetUrlRegex = /"targeturl"\s*:\s*"([^"]+)"/;

  async bypass(url: URL): Promise<string> {
    const pathId = url.pathname.split("/a/")[1];

    if (!pathId) {
      throw new Error("Invalid MBoost.me URL: Missing or invalid path.");
    }

    try {
      const { data } = await axios.get(url.href, {
        responseType: "text",
      });

      const regex = /"targeturl"\s*:\s*"([^"]+)"/;
      const match = regex.exec(data);

      if (!match || !match[1]) {
        throw new Error(
          "Failed to extract target URL from the page. The page structure may have changed.",
        );
      }

      const bypassedLink = match[1];
      return bypassedLink;
    } catch (error) {
      throw new Error(`Failed to bypass MBoost.me URL: ${error.message}`);
    }
  }
}
