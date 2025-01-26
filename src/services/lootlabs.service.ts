import axios from "axios";
import { LinkShortenerService } from "src/common/types/link-shortener-service.type";
import { decodeBase64 } from "src/utils/decodeBase64";

export class LootLabsService implements LinkShortenerService {
  public readonly name = "Lootlabs.gg";

  private readonly tidRegex = /p\['TID'\]\s*=\s*(\d+);/;
  private readonly tierIdRegex = /p\['TIER_ID'\]\s*=\s*'(\d+)';/;
  private readonly numOfTasksRegex = /p\['NUM_OF_TASKS'\]\s*=\s*'(\d+)';/;

  // Look for function in the global data called 'redirectToPublisherLink'
  private decodePublisherLink(publisherLink: string, keyLength = 5) {
    let result = "";
    const decodedPublisherLink = decodeBase64(publisherLink);

    const key = decodedPublisherLink.substring(0, keyLength);
    const encodedMessage = decodedPublisherLink.substring(keyLength);

    for (let num = 0; num < encodedMessage.length; num++) {
      const encodedCharCode = encodedMessage.charCodeAt(num);
      const keyChar = key.charCodeAt(num % key.length);
      const decodedChar = encodedCharCode ^ keyChar;

      result += String.fromCharCode(decodedChar);
    }

    return result;
  }

  private createCookieId() {
    const cookieId = (
      Math.floor(Math.random() * (999999999 - 100000000 + 1)) + 100000000
    ).toString();
    return cookieId;
  }

  async bypass(url: URL) {
    // https://nerventualken.com/tc
    if (url.pathname !== "/s" || !url.search.split("?")[1]) {
      throw new Error("Invalid LootLabs.gg URL : Missing or invalid path");
    }

    const { data } = await axios.get(url.href, { responseType: "text" });
    const match = this.tidRegex.exec(data);

    if (!match && !match[1]) {
      throw new Error("cannot get the pid...");
    }

    const tId = match[1];

    const match1 = this.tierIdRegex.exec(data);

    if (!match1 && !match1[1]) {
      throw new Error("cannot get tier id");
    }

    const tierId = match1[1];

    const match2 = this.numOfTasksRegex.exec(data);

    if (!match2 || !match2[1]) {
      throw new Error("cannot find num of tasks");
    }

    const designId = 102;

    // max_tasks // init
    // cur_url is the url

    // https://1.onsultingco.com/st?uid=52916735449380215&cat=14 POST
    // maybe they log the action?
    // wss://1.onsultingco.com/c?uid=52916735449380215&cat=14&key=637269397578985692
    // key isn't returned so we might have to go look for it...
    // connect to websocket to get the publisher link?

    // console.log(this.decodePublisherLink("NzQxNTlfQEVFSg0bHkdWVVheTRdUW1w="));

    return "";
  }
}
