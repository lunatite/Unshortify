import { HttpClient } from "src/http-client/http-client";
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
import { LinkvertiseUtils } from "./linkvertise-utils";

export class LinkvertiseSession {
  private accessToken: string | null = null;
  private _isInitialized = false;

  constructor(private readonly httpClient: HttpClient) {}

  private async request<T>(
    operationName: string,
    variables: object,
    query: string,
  ): Promise<T> {
    if (!this._isInitialized) {
      throw new Error("Session not initialized. Call initialize() first.");
    }

    const response = await this.httpClient.post<T>(
      "https://publisher.linkvertise.com/graphql",
      { operationName, query, variables },
      LinkvertiseUtils.getRequestConfig(this.accessToken),
    );

    return response.data;
  }

  private async validateSession() {
    const url = "https://publisher.linkvertise.com/api/v1/account";

    try {
      const { data } = await this.httpClient.get<AccountResponse>(
        url,
        LinkvertiseUtils.getRequestConfig(this.accessToken),
      );

      if (!data.success || !data.user_token) {
        throw new Error("Invalid access token or missing user token");
      }
    } catch (error) {
      throw new Error(`Failed to acquire session: ${error}`);
    }
  }

  async getDetailPageContent(userId: string | number, name: string) {
    const response = await this.request<DetailPageContentResponse>(
      "getDetailPageContent",
      {
        additional_data: {
          taboola: {
            external_referrer: "",
            user_id: "fallbackUserId",
            url: `https://linkvertise.com/${userId}/${name}`,
            test_group: "old",
            session_id: null,
          },
        },
        linkIdentificationInput: {
          userIdAndUrl: { user_id: userId, url: name },
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

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  async initialize(accessToken: string): Promise<void> {
    if (!accessToken) {
      throw new Error("Access token is required");
    }

    this.accessToken = accessToken;

    await this.validateSession();
    this._isInitialized = true;
  }
}
