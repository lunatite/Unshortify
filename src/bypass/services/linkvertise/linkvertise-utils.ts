export class LinkvertiseUtils {
  static createActionId() {
    let actionId = "";

    for (let i = 0; i < 3; i++) {
      actionId += crypto.randomUUID();
    }

    return actionId.slice(0, 100);
  }

  static getGraphqlUrl(userToken: string | null): string {
    let url = "https://publisher.linkvertise.com/graphql";
    if (userToken) {
      url += `?X-Linkvertise-UT=${userToken}`;
    }
    return url;
  }
}
