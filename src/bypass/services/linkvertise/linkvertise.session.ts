import { HttpClient } from "src/http-client/http-client";
import * as https from "https";
import {
  AccountResponse,
  CompleteDetailPageContentResponse,
  DetailPageContentResponse,
  DetailPageTargetResponse,
} from "./linkvertise.types";
import {
  GET_DETAIL_PAGE_CONTENT_QUERY,
  GET_COMPLETE_DETAIL_PAGE_CONTENT_QUERY,
  GET_DETAIL_PAGE_TARGET_QUERY,
} from "./graphql/page.queries";
import { extractCookiesFromHeaders } from "src/utils/extractCookiesFromHeaders";
import { LinkvertiseUtils } from "./linkvertise-utils";

export class LinkvertiseSession {
  private readonly headers = {
    Accept: "application/json",
    Host: "publisher.linkvertise.com",
    "Accept-Encoding": "gzip,deflate,br",
    Origin: "https://linkvertise.com",
    Referer: "https://linkvertise.com/",
  };

  private userToken: string | null = null;

  constructor(private readonly httpClient: HttpClient) {}

  private async request<T>(
    operationName: string,
    variables: object,
    query: string,
  ): Promise<T> {
    if (!this.userToken || !this.headers["Cookie"]) {
      throw new Error("Session not initialized. Call initialize() first.");
    }

    const response = await this.httpClient.post<T>(
      LinkvertiseUtils.getGraphqlUrl(this.userToken),
      { operationName, query, variables },
      {
        headers: this.headers,
        httpsAgent: new https.Agent({
          ciphers: "TLS_AES_128_GCM_SHA256",
        }),
      },
    );

    return response.data;
  }

  private async acquireSession(doNotAddCookie: boolean): Promise<void> {
    let url = "https://publisher.linkvertise.com/api/v1/account";
    if (this.userToken) {
      url += `?X-Linkvertise-UT=${this.userToken}`;
    }

    const response = await this.httpClient.get<AccountResponse>(url, {
      headers: this.headers,
      httpsAgent: new https.Agent({
        ciphers: "TLS_AES_128_GCM_SHA256",
      }),
    });

    if (!this.userToken) {
      this.userToken = response.data.user_token;
    }

    if (!doNotAddCookie) {
      const sessionCookie = extractCookiesFromHeaders(response.headers);
      if (!sessionCookie) {
        throw new Error("Failed to acquire Linkvertise session");
      }
      this.headers["Cookie"] = sessionCookie;
    }
  }

  async getDetailPageContent(userId: string | number, url: string) {
    const response = await this.request<DetailPageContentResponse>(
      "getDetailPageContent",
      {
        additional_data: {
          taboola: {
            external_referrer: "",
            user_id: "fallbackUserId",
            url: `https://linkvertise.com/${userId}/${url}`,
            test_group: "old",
            session_id: null,
          },
        },
        linkIdentificationInput: {
          userIdAndUrl: { user_id: userId, url },
        },
      },
      GET_DETAIL_PAGE_CONTENT_QUERY,
    );

    const data = response.data.getDetailPageContent;

    return {
      accessToken: data.access_token,
      isPremiumOnlyLink: data.link.is_premium_only_link,
    };
  }

  async getCompleteDetailPageContent(
    userId: number | string,
    name: string,
    accessToken: string,
  ) {
    const response = await this.request<CompleteDetailPageContentResponse>(
      "completeDetailPageContent",
      {
        linkIdentificationInput: {
          userIdAndUrl: { user_id: userId, url: name },
        },
        completeDetailPageContentInput: {
          access_token: accessToken,
        },
      },
      GET_COMPLETE_DETAIL_PAGE_CONTENT_QUERY,
    );

    const data = response.data.completeDetailPageContent;

    return {
      targetToken: data.TARGET,
      remainingWaitingTime:
        data.additional_target_access_information.remaining_waiting_time,
    };
  }

  async getDetailPageTarget(
    userId: number | string,
    name: string,
    targetToken: string,
  ) {
    const response = await this.request<DetailPageTargetResponse>(
      "getDetailPageTarget",
      {
        linkIdentificationInput: {
          userIdAndUrl: { user_id: userId, url: name },
        },
        token: targetToken,
        action_id: LinkvertiseUtils.createActionId(),
      },
      GET_DETAIL_PAGE_TARGET_QUERY,
    );

    const data = response.data.getDetailPageTarget;
    return data.type === "URL" ? data.url : data.paste;
  }

  async initialize(): Promise<void> {
    // Firstly, we only need to acquire the user token.
    await this.acquireSession(true);

    // Then this time we will acquire the session cookie with the user token.
    await this.acquireSession(false);
  }
}
