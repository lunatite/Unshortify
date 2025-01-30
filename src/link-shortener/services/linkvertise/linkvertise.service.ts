import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import axios, { Method } from "axios";
import * as https from "https";
import { LinkShortenerService } from "../../link-shortener.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { wait } from "src/utils/wait";

export type AccountResponse = {
  user_token: string;
};

export type DetailPageContentResponse = {
  data: {
    getDetailPageContent: {
      access_token: string;
      premium_subscription_active: null;
      link: {
        is_premium_only_link: boolean;
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
export class LinkvertiseService implements LinkShortenerService {
  public readonly name = "Linkvertise";
  private readonly httpsAgent;
  private readonly graphqlUrl;

  constructor() {
    // Cloudflare can detect that Node.js is making the request, so simply change the cipher.
    this.httpsAgent = new https.Agent({
      ciphers: "TLS_AES_128_GCM_SHA256",
    });

    this.graphqlUrl = "https://publisher.linkvertise.com/graphql";
  }

  private async request<T>(url: string, method: Method, data?: unknown) {
    const response = await axios<T>({
      url,
      method,
      data,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64; rv:135.0) Gecko/20100101 Firefox/135.0",
        Accept: "application/json",
        Host: "publisher.linkvertise.com",
        "Accept-Encoding": "gzip,deflate,br",
        Cookie: "laravel_session=0",
      },
      httpsAgent: this.httpsAgent,
    });

    return response.data;
  }

  private async getDetailPageContent(userId: string | number, url: string) {
    const response = await this.request<DetailPageContentResponse>(
      this.graphqlUrl,
      "POST",
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
          "mutation getDetailPageContent($linkIdentificationInput: PublicLinkIdentificationInput!, $origin: String, $additional_data: CustomAdOfferProviderAdditionalData!) {\n  getDetailPageContent(\n    linkIdentificationInput: $linkIdentificationInput\n    origin: $origin\n    additional_data: $additional_data\n  ) {\n    access_token\n premium_subscription_active\n    link {\n is_premium_only_link\n }\n }\n}",
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
      "POST",
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
      "POST",
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

  async bypass(url: URL) {
    const [_, userId, name] = url.pathname.split("/");

    if (!userId || !name) {
      throw new InvalidPathException("/{userId}/{name}");
    }

    const detailPageContent = await this.getDetailPageContent(userId, name);

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

    if (remaining_waiting_time > 10) {
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

    if (detailPageTarget.type === "URL") {
      return detailPageTarget.url;
    }

    return detailPageTarget.paste;
  }
}
