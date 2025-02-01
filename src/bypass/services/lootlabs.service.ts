import { InternalServerErrorException } from "@nestjs/common";
import axios from "axios";
import * as WebSocket from "ws";
import { LinkProcessorHandler } from "../link-processor.types";
import { decodeBase64 } from "src/utils/decodeBase64";
import { MissingParameterError } from "src/common/errors";

export type LootLabsTaskAction = {
  action_pixel_url: string;
  ad_url: string;
  urid: number;
  test_counter: number;
  time_to_complete: number;
  test_choose: number;
  tooltip: string;
  timer: number;
  session_id: number;
  new_tab: boolean;
  task_id: string;
  title: string;
  window_size: string;
  sub_title: string;
  icon: string;
  auto_complete_seconds: number;
};

export type LootLabsConfigKey =
  | "CDN_DOMAIN"
  | "TID"
  | "INCENTIVE_AVATAR"
  | "PUBLISHER_IMAGE"
  | "PUBLISHER_NAME"
  | "PUBLISHER_TITLE"
  | "KEY"
  | "SHOW_UNLOCKER"
  | "TIER_ID";

export class LootLabsService implements LinkProcessorHandler {
  public readonly name = "Lootlabs.gg";

  private readonly designId = 102;

  // Look for function in the global data called 'redirectToPublisherLink'
  private decodePublisherLink(publisherLink: string, keyLength = 5) {
    let result = "";
    const decodedPublisherLink = decodeBase64(publisherLink);

    const key = decodedPublisherLink.substring(0, keyLength);
    const encodedMessage = decodedPublisherLink.substring(keyLength);

    for (let num = 0; num < encodedMessage.length; num++) {
      const encodedCharCode = encodedMessage.charCodeAt(num);
      const keyChar = key.charCodeAt(num % key.length);
      const decodedChar = encodedCharCode ^ keyChar;

      result += String.fromCharCode(decodedChar);
    }

    return result;
  }

  private createCookieId() {
    const cookieId = (
      Math.floor(Math.random() * (999999999 - 100000000 + 1)) + 100000000
    ).toString();
    return cookieId;
  }

  private createSessionId() {
    const sessionId = Math.floor(Math.random() * 10 ** 18) + 10 ** 17;
    return sessionId;
  }

  // Looks like it doesn't matter if the taboola user id is empty...
  private async fetchTaboolaUserId() {
    // const { data } = await axios.get<{
    //   user: { id: string; isNewUser: boolean };
    // }>(
    //   `https://api.taboola.com/2.0/json/lootlabs-roblox/user.sync?app.apikey=${this.taboolaApiKey}&app.type=desktop`,
    // );

    return "";

    // return data.user.id;
  }

  private getConfigKeyFromHtml(key: LootLabsConfigKey, html: string) {
    const regex = new RegExp(`p\\['${key}'\\]\\s*=\\s*(?:'|")?(.*?)(?:'|")?;`);
    const match = regex.exec(html);

    if (!match || !match[1]) {
      throw new InternalServerErrorException(
        `Failed to extract ${key} from the HTML content`,
      );
    }

    return match[1];
  }

  // is tId the taskId idk?
  private async fetchTaskConfiguration(
    cdnDomain: string,
    tId: string | number,
  ) {
    const { data: rawData } = await axios.get<string>(
      `https://${cdnDomain}?tid=${tId}&params_only=1`,
    );

    const jsonArrayString = "[" + rawData.slice(1, -2) + "]";
    const taskConfigData = JSON.parse(jsonArrayString);

    return {
      PIXEL_DOMAIN: taskConfigData[2],
      SERVING_METHOD_ID: taskConfigData[3],
      CLOUDFRONT_BACKUP_DOMAIN: taskConfigData[4],
      INCENTIVE_NUMBER_OF_TASKS: taskConfigData[6],
      INCENTIVE_BL_TASKS: taskConfigData[7],
      INCENTIVE_SERVER_DOMAIN: taskConfigData[9],
      INCENTIVE_NEW_WINDOW_DOMAIN: taskConfigData[13],
      INCENTIVE_CLOSE_BTN_INTERVAL: taskConfigData[15],
      INCENTIVE_COLORS: taskConfigData[16],
      INCENTIVE_REDIRECT: taskConfigData[17],
      INCENTIVE_SYNCER_DOMAIN: taskConfigData[29],
      ALLOW_UNLOCKER: taskConfigData[30],
      INCENTIVE_BACKGROUND:
        "https://d3h26c51lqz4go.cloudfront.net/loot-sources/town-bg.jpg",
    };
  }

  private async fetchTaskActions(url: URL) {
    const { data: htmlContent } = await axios.get(url.href, {
      responseType: "text",
    });

    const tId = this.getConfigKeyFromHtml("TID", htmlContent);
    const cdnDomain = this.getConfigKeyFromHtml("CDN_DOMAIN", htmlContent);
    const key = this.getConfigKeyFromHtml("KEY", htmlContent);
    const taboolaUserId = await this.fetchTaboolaUserId();
    const taskConfiguration = await this.fetchTaskConfiguration(cdnDomain, tId);

    const payload = {
      bl: taskConfiguration.INCENTIVE_BL_TASKS,
      cookie_id: this.createCookieId(),
      cur_url: url.href,
      design_id: this.designId,
      doc_ref: "", // window.document.referrer
      max_tasks: taskConfiguration.INCENTIVE_NUMBER_OF_TASKS,
      num_of_tasks: "1",
      session: this.createSessionId(),
      taboola_user_sync: taboolaUserId,
      tid: +tId,
      tier_id: "1",
    };

    const { data: taskActionsData } = await axios.post<
      Array<LootLabsTaskAction>
    >("https://nerventualken.com/tc", payload);

    return {
      key,
      actions: taskActionsData,
    };
  }

  private sendTelemetry(urid: number) {
    const url = `https://0.onsultingco.com/st?uid=${urid}&cat=14`;
    axios.get(url);
  }

  private async connectAndDecodePublisherLink(
    wsUrl: string,
    decodePublisherLink: (encodedLink: string) => string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      let idleCheckInterval = null;
      let idleCheckCount = 0;
      const idleCheckIntervalDirection = 10000;
      const maxIdleChecks = 10;

      const cleanup = () => {
        if (idleCheckInterval) {
          clearInterval(idleCheckInterval);
          idleCheckInterval = null;
        }

        ws.close();
      };

      ws.onopen = function () {
        idleCheckInterval = setInterval(() => {
          idleCheckCount++;

          if (idleCheckCount > maxIdleChecks) {
            cleanup();
            reject(
              new InternalServerErrorException(
                "Too many idle checks: No response from server",
              ),
            );
            return;
          }

          ws.send("0");
        }, idleCheckIntervalDirection);
      };

      ws.onmessage = (message) => {
        const data = message.data as string;

        if (data.startsWith("r:")) {
          const encodedPublisherLink = data.split("r:")[1];
          const decodedPublisherLink =
            decodePublisherLink(encodedPublisherLink);

          cleanup();
          resolve(decodedPublisherLink);
        }
      };

      ws.onclose = function () {
        cleanup();
      };

      ws.onerror = function (error) {
        reject(error);
        cleanup();
      };
    });
  }

  async resolve(url: URL) {
    if (url.pathname !== "/s" || !url.search.split("?")[1]) {
      throw new MissingParameterError("s");
    }

    const { key, actions } = await this.fetchTaskActions(url);
    const urid = actions[0].urid;

    this.sendTelemetry(urid);

    const wsUrl =
      "wss://0.onsultingco.com/c?uid=" + urid + "&cat=14&key=" + key;

    const decodedPublisherLink = await this.connectAndDecodePublisherLink(
      wsUrl,
      this.decodePublisherLink,
    );

    return decodedPublisherLink;
  }
}
