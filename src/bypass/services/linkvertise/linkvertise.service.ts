import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { Method } from "axios";
import {
  GET_COMPLETE_DETAIL_PAGE_CONTENT_QUERY,
  GET_DETAIL_PAGE_CONTENT_QUERY,
  GET_DETAIL_PAGE_TARGET_QUERY,
} from "./graphql/page.queries";
import { HttpClient } from "src/http-client/http-client";
import { LinkProcessorHandler } from "../../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { wait } from "src/utils/wait";
import { toUnixTimestamp } from "src/utils/toUnixTimestamp";
import {
  DetailPageContentResponse,
  CompleteDetailPageContentResponse,
  DetailPageTargetResponse,
} from "./linkvertise.types";

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
        query: GET_DETAIL_PAGE_CONTENT_QUERY,
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
        query: GET_COMPLETE_DETAIL_PAGE_CONTENT_QUERY,
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
        query: GET_DETAIL_PAGE_TARGET_QUERY,
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
