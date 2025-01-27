import axios from "axios";
import { LinkShortenerService } from "../link-shortener.types";

export class AdFocusService implements LinkShortenerService {
  public readonly name = "Adfoc.us";

  async bypass(url: URL): Promise<string> {
    if (url.pathname === "/") {
      throw new Error("Missing id path...");
    }

    try {
      const { data } = await axios.get(url.href, {
        responseType: "text", // Correct response type
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });

      const regex = /var click_url\s*=\s*"([^"]+)"/;
      const match = regex.exec(data);

      if (!match || !match[1]) {
        throw new Error(
          "Unable to extract the destination URL from the Adfoc.us page. The page structure may have changed or the link is invalid.",
        );
      }

      const bypassedLink = match[1];
      return bypassedLink;
    } catch (error) {
      throw new Error(`Failed to bypass URL: ${error.message}`);
    }
  }
}
