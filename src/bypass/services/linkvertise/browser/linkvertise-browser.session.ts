// import { Page } from "puppeteer";
// import {
//   AccountResponse,
//   CompleteDetailPageContentResponse,
//   DetailPageContentResponse,
//   DetailPageTargetResponse,
// } from "./linkvertise.types";
// import {
//   GET_DETAIL_PAGE_CONTENT_QUERY,
//   GET_COMPLETE_DETAIL_PAGE_CONTENT_QUERY,
//   GET_DETAIL_PAGE_TARGET_QUERY,
// } from "./graphql/page.queries";
// import { LinkvertiseUtils } from "./linkvertise-utils";

// export class LinkvertiseBrowserSession {
//   private readonly headers = {
//     Accept: "application/json",
//     Host: "publisher.linkvertise.com",
//     "Accept-Encoding": "gzip,deflate,br",
//     Origin: "https://linkvertise.com",
//     Referer: "https://linkvertise.com/",
//   };

//   private initialized = false;
//   private userToken: string | null = null;

//   constructor(private readonly page: Page) {}

//   private async fetchFromPage<T>(
//     url: string,
//     options: RequestInit,
//   ): Promise<T> {
//     return this.page.evaluate(
//       async (url, options) => {
//         const headers = {
//           ...options.headers,
//         };

//         if (options?.method === "POST") {
//           headers["Content-Type"] = "application/json";
//         }

//         const response = await fetch(url, {
//           ...options,
//           headers,
//         });
//         return response.json();
//       },
//       url,
//       options,
//     );
//     // .catch(() => this.page.close());
//   }

//   private async acquireSession(): Promise<void> {
//     if (this.initialized) {
//       throw new Error("Session already initialized.");
//     }

//     const url = this.userToken
//       ? `https://publisher.linkvertise.com/api/v1/account?X-Linkvertise-UT=${this.userToken}`
//       : "https://publisher.linkvertise.com/api/v1/account";

//     const data: AccountResponse = await this.fetchFromPage(url, {
//       headers: this.headers,
//     });
//     this.userToken = data.user_token;
//   }

//   async getDetailPageContent(userId: string | number, name: string) {
//     if (!this.initialized) {
//       throw new Error("Session not initialized. Call initialize() first.");
//     }

//     const url = LinkvertiseUtils.getGraphqlUrl(this.userToken);
//     const body = JSON.stringify({
//       operationName: "getDetailPageContent",
//       variables: {
//         additional_data: {
//           taboola: {
//             external_referrer: "",
//             user_id: "fallbackUserId",
//             url: `https://linkvertise.com/${userId}/${name}`,
//             test_group: "old",
//             session_id: null,
//           },
//         },
//         linkIdentificationInput: {
//           userIdAndUrl: { user_id: userId, url: name },
//         },
//       },
//       query: GET_DETAIL_PAGE_CONTENT_QUERY,
//     });

//     const response = await this.fetchFromPage<DetailPageContentResponse>(url, {
//       method: "POST",
//       headers: this.headers,
//       body,
//     });

//     const data = response.data.getDetailPageContent;

//     return {
//       accessToken: data.access_token,
//       isPremiumOnlyLink: data.link.is_premium_only_link,
//     };
//   }

//   async getCompleteDetailPageContent(
//     userId: number | string,
//     name: string,
//     accessToken: string,
//   ) {
//     if (!this.initialized) {
//       throw new Error("Session not initialized. Call initialize() first.");
//     }

//     const url = LinkvertiseUtils.getGraphqlUrl(this.userToken);
//     const body = JSON.stringify({
//       operationName: "completeDetailPageContent",
//       variables: {
//         linkIdentificationInput: {
//           userIdAndUrl: { user_id: userId, url: name },
//         },
//         completeDetailPageContentInput: {
//           access_token: accessToken,
//         },
//       },
//       query: GET_COMPLETE_DETAIL_PAGE_CONTENT_QUERY,
//     });

//     const response =
//       await this.fetchFromPage<CompleteDetailPageContentResponse>(url, {
//         body,
//         headers: this.headers,
//         method: "POST",
//       });

//     const data = response.data.completeDetailPageContent;

//     return {
//       targetToken: data.TARGET,
//       remainingWaitingTime:
//         data.additional_target_access_information.remaining_waiting_time,
//     };
//   }

//   async getDetailPageTarget(
//     userId: number | string,
//     name: string,
//     targetToken: string,
//   ) {
//     if (!this.initialized) {
//       throw new Error("Session not initialized. Call initialize() first.");
//     }

//     const url = LinkvertiseUtils.getGraphqlUrl(this.userToken);
//     const body = JSON.stringify({
//       operationName: "getDetailPageTarget",
//       variables: {
//         linkIdentificationInput: {
//           userIdAndUrl: { user_id: userId, url: name },
//         },
//         token: targetToken,
//         action_id: LinkvertiseUtils.createActionId(),
//       },
//       query: GET_DETAIL_PAGE_TARGET_QUERY,
//     });

//     const response = await this.fetchFromPage<DetailPageTargetResponse>(url, {
//       body,
//       headers: this.headers,
//       method: "POST",
//     });

//     const data = response.data.getDetailPageTarget;
//     return data.type === "URL" ? data.url : data.paste;
//   }

//   async close() {
//     await this.page.close();
//   }

//   async initialize(): Promise<void> {
//     if (this.initialized) {
//       throw new Error("Already initalized...");
//     }

//     // First, we need to acquire the user token.
//     await this.acquireSession();

//     // Next, we need to fetch the laravel_session token with the user token passed in.
//     await this.acquireSession();

//     this.initialized = true;
//   }
// }
