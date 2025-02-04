import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { HttpClient } from "src/http-client/http-client";
import { LinkProcessorHandler } from "../../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { wait } from "src/utils/wait";
import { toUnixTimestamp } from "src/utils/toUnixTimestamp";
import { Method } from "axios";

export type AccountResponse = {
  user_token: string;
};

export type LinkvertiseCacheData = {
  result: string;
  lastEditAtSeconds: number;
};

export type DetailPageContentResponse = {
  data: {
    getDetailPageContent: {
      access_token: string;
      premium_subscription_active: null;
      link: {
        is_premium_only_link: boolean;
        last_edit_at: string;
      };
    };
  };
};

export type CompleteDetailPageContentResponse = {
  data: {
    completeDetailPageContent: {
      CUSTOM_AD_STEP: string;
      TARGET: string;
      additional_target_access_information: {
        remaining_waiting_time: number;
        can_not_access: boolean;
        should_show_ads: boolean;
        has_long_paywall_duration: boolean;
      };
    };
  };
};

export type DetailPageTargetResponse = {
  data: {
    getDetailPageTarget: {
      type: "URL" | "PASTE";
      url: string | null;
      paste: string | null;
    };
  };
};

@Injectable()
export class LinkvertiseService implements LinkProcessorHandler {
  public readonly name = "Linkvertise";
  private readonly graphqlUrl;
  private readonly defaultWaitTime = 10;

  constructor(private readonly httpClient: HttpClient) {
    this.graphqlUrl = "https://publisher.linkvertise.com/graphql";
  }

  private async request<T>(url: string, method: Method, data?: unknown) {
    const response = await this.httpClient[method]<T>(url, data, {
      headers: {
        Cookie: "laravel_session=0",
        Accept: "application/json",
        Host: "publisher.linkvertise.com",
        "Accept-Encoding": "gzip,deflate,br",
      },
    });

    return response.data;
  }

  private async getDetailPageContent(userId: string | number, url: string) {
    const response = await this.request<DetailPageContentResponse>(
      this.graphqlUrl,
      "post",
      {
        operationName: "getDetailPageContent",
        variables: {
          linkIdentificationInput: {
            userIdAndUrl: { user_id: userId, url },
          },
          additional_data: {
            taboola: {
              user_id: "fallbackUserId",
              url: `https://linkvertise.com/${userId}/${url}`,
              test_group: "old",
              session_id: "a",
            },
          },
        },
        query:
          "mutation getDetailPageContent($linkIdentificationInput: PublicLinkIdentificationInput!, $origin: String, $additional_data: CustomAdOfferProviderAdditionalData!) {\n  getDetailPageContent(\n    linkIdentificationInput: $linkIdentificationInput\n    origin: $origin\n    additional_data: $additional_data\n  ) {\n    access_token\n premium_subscription_active\n    link {\n is_premium_only_link\n \n last_edit_at \n}\n }\n}",
      },
    );

    return response.data.getDetailPageContent;
  }

  private async getCompleteDetailPageContent(
    userId: number | string,
    url: string,
    accessToken: string,
  ) {
    const response = await this.request<CompleteDetailPageContentResponse>(
      this.graphqlUrl,
      "post",
      {
        operationName: "completeDetailPageContent",
        variables: {
          linkIdentificationInput: {
            userIdAndUrl: { user_id: userId, url },
          },
          completeDetailPageContentInput: {
            access_token: accessToken,
          },
        },
        query:
          "mutation completeDetailPageContent($linkIdentificationInput: PublicLinkIdentificationInput!, $completeDetailPageContentInput: CompleteDetailPageContentInput!) {\n  completeDetailPageContent(\n    linkIdentificationInput: $linkIdentificationInput\n    completeDetailPageContentInput: $completeDetailPageContentInput\n  ) {\n    CUSTOM_AD_STEP\n    TARGET\n    additional_target_access_information {\n      remaining_waiting_time\n      can_not_access\n      should_show_ads\n      has_long_paywall_duration\n }\n }\n}",
      },
    );

    return response.data.completeDetailPageContent;
  }

  private async getDetailPageTarget(
    userId: number | string,
    url: string,
    targetToken: string,
  ) {
    const response = await this.request<DetailPageTargetResponse>(
      this.graphqlUrl,
      "get",
      {
        operationName: "getDetailPageTarget",
        variables: {
          linkIdentificationInput: {
            userIdAndUrl: { user_id: userId, url },
          },
          token: targetToken,
          action_id: this.createActionId(),
        },
        query:
          "mutation getDetailPageTarget($linkIdentificationInput: PublicLinkIdentificationInput!, $token: String!, $action_id: String) {\n  getDetailPageTarget(\n    linkIdentificationInput: $linkIdentificationInput\n    token: $token\n    action_id: $action_id\n  ) {\n    type\n    url\n    paste\n }\n}",
      },
    );

    return response.data.getDetailPageTarget;
  }

  private createActionId() {
    let actionId = "";

    for (let i = 0; i < 3; i++) {
      actionId += crypto.randomUUID();
    }

    return actionId.slice(0, 100);
  }

  async resolve(url: URL) {
    const [_, userId, name] = url.pathname.split("/");

    if (!userId || !name) {
      throw new InvalidPathException("/{userId}/{name}");
    }

    const detailPageContent = await this.getDetailPageContent(userId, name);
    const lastEditAtSeconds = toUnixTimestamp(
      detailPageContent.link.last_edit_at,
    );

    if (detailPageContent.link.is_premium_only_link) {
      throw new BadRequestException(
        "Link can only be accessed by premium users",
      );
    }

    const {
      TARGET: targetToken,
      additional_target_access_information: { remaining_waiting_time },
    } = await this.getCompleteDetailPageContent(
      userId,
      name,
      detailPageContent.access_token,
    );

    if (remaining_waiting_time > this.defaultWaitTime) {
      throw new InternalServerErrorException(
        "Cooldown in progress. Please wait before trying again",
      );
    }

    // You must wait 10 seconds, or else you'll immediately have to wait for a 1-hour cooldown
    await wait(1000 * remaining_waiting_time + 500);

    const detailPageTarget = await this.getDetailPageTarget(
      userId,
      name,
      targetToken,
    );

    const result =
      detailPageTarget.type === "URL"
        ? detailPageTarget.url
        : detailPageTarget.paste;

    return result;
  }
}
