import { FastApiCurlProxyService } from "src/fast-api-curl-proxy/fastapi-curl-proxy.service";
import {
  AccountResponse,
  CompleteDetailPageContentResponse,
  DetailPageContentResponse,
  GetDetailPageTargetResponse,
} from "./linkvertise.types";
import {
  GET_COMPLETE_DETAIL_PAGE_CONTENT_QUERY,
  GET_DETAIL_PAGE_CONTENT_QUERY,
  GET_DETAIL_PAGE_TARGET_QUERY,
} from "./graphql/queries";
import { LinkvertiseUtils } from "./linkvertise.utils";

export class LinkvertiseSession {
  private isInitialized = false;
  private authBearerToken: string | undefined = undefined;
  private userToken: string | undefined = undefined;

  private static readonly HEADERS = {
    Accept: "application/json",
    "Accept-Encoding": "gzip, deflate, br",
    Host: "publisher.linkvertise.com",
    Priority: "u=0, i",
    Origin: "https://linkvertise.com",
    Referer: "https://linkvertise.com/",
  };

  private static readonly GRAPHQL_URL =
    "https://publisher.linkvertise.com/graphql";
  private static readonly ACCOUNT_URL =
    "https://publisher.linkvertise.com/api/v1/account";

  private static readonly IMPERSONATE_BROWSER_NAME = "safari";

  constructor(private readonly httpProxyService: FastApiCurlProxyService) {}

  private async graphql<T>(
    operationName: string,
    variables: Record<string, unknown>,
    query: string,
  ) {
    const response = await this.httpProxyService.post<T>({
      url:
        LinkvertiseSession.GRAPHQL_URL + `?X-Linkvertise-UT=${this.userToken}`,
      impersonate: LinkvertiseSession.IMPERSONATE_BROWSER_NAME,
      data: {
        operationName,
        variables,
        query,
      },
    });

    return response.data;
  }

  private async acquireSession() {
    if (this.userToken) {
      return this.userToken;
    }

    const response = await this.httpProxyService.get<AccountResponse>({
      url: LinkvertiseSession.ACCOUNT_URL,
      impersonate: LinkvertiseSession.IMPERSONATE_BROWSER_NAME,
      headers: {
        ...LinkvertiseSession.HEADERS,
        Authorization: this.authBearerToken,
      },
    });

    if (this.authBearerToken && response.data.error) {
      throw new Error("Invalid Linkvertise auth bearer token");
    }

    this.userToken = response.data.user_token;
    return this.userToken;
  }

  async getDetailPageContent(userId: string, name: string) {
    this.ensureInitialized();

    const response = await this.graphql<DetailPageContentResponse>(
      "getDetailPageContent",
      {
        additional_data: {
          taboola: {
            external_referrer: "",
            session_id: null,
            url: `https://linkvertise.com/${userId}/${name}`,
            user_id: "fallbackUserId",
            test_group: "old",
          },
        },
        linkIdentificationInput: {
          userIdAndUrl: {
            url: name,
            user_id: userId,
          },
        },
      },
      GET_DETAIL_PAGE_CONTENT_QUERY,
    );

    const { link, premium_subscription_active, access_token } =
      response.data.getDetailPageContent;

    return {
      isPremiumLink: link.is_premium_only_link,
      premiumSubscriptionActive: premium_subscription_active,
      accessToken: access_token,
    };
  }

  async getCompleteDetailPageContent(
    userId: string,
    name: string,
    accessToken: string,
  ) {
    this.ensureInitialized();

    const response = await this.graphql<CompleteDetailPageContentResponse>(
      "completeDetailPageContent",
      {
        linkIdentificationInput: {
          userIdAndUrl: {
            user_id: userId,
            url: name,
          },
        },
        completeDetailPageContentInput: {
          access_token: accessToken,
        },
      },
      GET_COMPLETE_DETAIL_PAGE_CONTENT_QUERY,
    );

    const {
      TARGET: targetToken,
      additional_target_access_information: {
        remaining_waiting_time,
        has_long_paywall_duration,
      },
    } = response.data.completeDetailPageContent;

    return {
      targetToken,
      remainingWaitingTime: remaining_waiting_time,
      hasLongPaywallDuration: has_long_paywall_duration,
    };
  }

  async getDetailPageTarget(userId: string, name: string, targetToken: string) {
    this.ensureInitialized();

    const {
      data: { getDetailPageTarget },
    } = await this.graphql<GetDetailPageTargetResponse>(
      "getDetailPageTarget",
      {
        linkIdentificationInput: {
          userIdAndUrl: {
            user_id: userId,
            url: name,
          },
        },
        token: targetToken,
        action_id: LinkvertiseUtils.createActionId(),
      },
      GET_DETAIL_PAGE_TARGET_QUERY,
    );

    return getDetailPageTarget.type === "URL"
      ? getDetailPageTarget.url
      : getDetailPageTarget.paste;
  }

  async initialize(authBearerToken?: string) {
    if (this.isInitialized) {
      throw new Error("Linkvertise session is already initialized");
    }

    this.authBearerToken = authBearerToken;
    await this.acquireSession();
    this.isInitialized = true;
  }

  private ensureInitialized() {
    if (!this.isInitialized) {
      throw new Error("Linkvertise session is not initialized");
    }
  }
}
