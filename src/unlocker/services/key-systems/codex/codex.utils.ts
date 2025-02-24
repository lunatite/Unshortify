export class CodexUtils {
  public static getTaskReferrer(link: string) {
    if (link.includes("loot-links")) {
      return "https://loot-links.com/";
    }

    if (link.includes("loot-link")) {
      return "https://loot-link.com/";
    }

    return "https://linkvertise.com/";
  }
}
