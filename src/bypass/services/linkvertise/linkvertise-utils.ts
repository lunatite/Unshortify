import * as https from "https";

export class LinkvertiseUtils {
  private static readonly headers = {
    Accept: "application/json",
    Host: "publisher.linkvertise.com",
    "Accept-Encoding": "gzip,deflate,br",
    Origin: "https://linkvertise.com",
    Referer: "https://linkvertise.com/",
  };

  private static readonly httpsAgent = new https.Agent({
    ciphers: "TLS_AES_128_GCM_SHA256",
  });

  static createActionId() {
    let actionId = "";

    for (let i = 0; i < 3; i++) {
      actionId += crypto.randomUUID();
    }

    return actionId.slice(0, 100);
  }

  // static getGraphqlUrl(userToken: string | null): string {
  //   let url = "https://publisher.linkvertise.com/graphql";
  //   if (userToken) {
  //     url += `?X-Linkvertise-UT=${userToken}`;
  //   }
  //   return url;
  // }

  static getRequestConfig(accessToken: string | null) {
    return {
      headers: {
        ...this.headers,
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
      httpsAgent: this.httpsAgent,
    };
  }
}
