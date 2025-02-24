import { fromBase64 } from "src/utils/b64";

export class LootLabsUtils {
  static decodePublisherLink(encodedPublisherLink: string, keyLength = 5) {
    let result = "";
    const decodedPublisherLink = fromBase64(encodedPublisherLink);

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

  static createCookieId() {
    const cookieId = (
      Math.floor(Math.random() * (999999999 - 100000000 + 1)) + 100000000
    ).toString();
    return cookieId;
  }

  static createSessionId() {
    const sessionId = Math.floor(Math.random() * 10 ** 18) + 10 ** 17;
    return sessionId;
  }
}
