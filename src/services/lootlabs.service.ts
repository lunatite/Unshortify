import { LinkShortenerService } from "src/common/types/link-shortener-service.type";
import { decodeBase64 } from "src/utils/decodeBase64";

export class LootLabsService implements LinkShortenerService {
  public readonly name = "Lootlabs.gg";

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

  async bypass(url: URL) {
    console.log(this.decodePublisherLink("NTQ2MzBdQEJDQw8bGUFfV1hZSx5WW1s="));

    return "";
  }
}
