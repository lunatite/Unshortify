import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import * as WebSocket from "ws";
import { LootLabsUtils } from "./lootlabs.utils";
import { LootLabsConfigKey, LootLabsTaskAction } from "./lootlabs.types";
import { LinkProcessorHandler } from "../../link-processor.types";
import { MissingParameterError } from "src/common/errors";
import { extractMatch } from "src/utils/extractMatch";
import { InvalidInitialLinkError } from "src/bypass/errors/invalid-initial-link.error";
import { SupportedHosts } from "src/bypass/decorators/supported-hosts.decorator";

@Injectable()
@SupportedHosts(["lootdest.org", "loot-link.com", "loot-links.com"])
export class LootLabsService implements LinkProcessorHandler {
  public readonly name = "Lootlabs.gg";

  public static readonly DESIGN_ID = 102;
  private static readonly TASKS_API_URL = "https://nerventualken.com/tc";
  private static readonly TELEMETRY_URL = "https://0.onsultingco.com/st";
  private static readonly WEBSOCKET_URL = "wss://0.onsultingco.com/c";
  private static readonly INCENTIVE_BACKGROUND =
    "https://d3h26c51lqz4go.cloudfront.net/loot-sources/town-bg.jpg";

  constructor(private readonly httpService: HttpService) {}

  private extractConfigKey(key: LootLabsConfigKey, html: string) {
    const regex = new RegExp(`p\\['${key}'\\]\\s*=\\s*(?:'|")?(.*?)(?:'|")?;`);
    const configKey = extractMatch(html, regex);

    if (!configKey) {
      throw new Error(
        `Failed to extract ${key} config key. The ${key} format may have changed, or it may be missing.`,
      );
    }

    return configKey;
  }

  private extractTaskData(htmlContent: string) {
    return {
      tId: +this.extractConfigKey("TID", htmlContent),
      cdnDomain: this.extractConfigKey("CDN_DOMAIN", htmlContent),
      key: this.extractConfigKey("KEY", htmlContent),
    };
  }

  // is tId the taskId idk?
  private async fetchTaskConfiguration(
    cdnDomain: string,
    tId: string | number,
  ) {
    const { data: rawData } = await this.httpService.axiosRef.get<string>(
      `https://${cdnDomain}?tid=${tId}&params_only=1`,
    );

    let taskConfigData;

    try {
      taskConfigData = JSON.parse("[" + rawData.slice(1, -2) + "]");
    } catch (error) {
      throw new Error("Failed to parse task configuration JSON");
    }

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
      INCENTIVE_BACKGROUND: LootLabsService.INCENTIVE_BACKGROUND,
    };
  }

  private async fetchTaskActions(url: URL) {
    const { data: htmlContent, status } =
      await this.httpService.axiosRef.get<string>(url.href, {
        responseType: "text",
      });

    if (status === 204) {
      throw new InvalidInitialLinkError(url);
    }

    const { tId, cdnDomain, key } = this.extractTaskData(htmlContent);
    const taskConfiguration = await this.fetchTaskConfiguration(cdnDomain, tId);

    const payload = {
      bl: taskConfiguration.INCENTIVE_BL_TASKS,
      cookie_id: LootLabsUtils.createCookieId(),
      cur_url: url.href,
      design_id: LootLabsService.DESIGN_ID,
      doc_ref: "", // window.document.referrer
      max_tasks: taskConfiguration.INCENTIVE_NUMBER_OF_TASKS,
      num_of_tasks: "1",
      session: LootLabsUtils.createSessionId(),
      taboola_user_sync: "",
      tid: tId,
      tier_id: "1",
    };

    const { data: taskActionsData } = await this.httpService.axiosRef.post<
      Array<LootLabsTaskAction>
    >(LootLabsService.TASKS_API_URL, payload);

    return {
      key,
      actions: taskActionsData,
    };
  }

  private async sendTelemetry(urid: number) {
    const url = `${LootLabsService.TELEMETRY_URL}?uid=${urid}&cat=14`;

    try {
      await this.httpService.axiosRef.get(url, {
        timeout: 1000 * 70,
        httpsAgent: null,
      });
    } catch (error) {
      throw new Error("Telemetry failed");
    }
  }

  private async connectAndDecodePublisherLink(wsUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      let idleCheckInterval = null;
      let idleCheckCount = 0;
      const idleCheckIntervalDirection = 10000;
      const maxIdleChecks = 10;

      const cleanup = () => {
        if (idleCheckInterval) {
          clearInterval(idleCheckInterval);
        }

        ws.close();
      };

      ws.onopen = function () {
        idleCheckInterval = setInterval(() => {
          idleCheckCount++;

          if (idleCheckCount > maxIdleChecks) {
            cleanup();

            reject(
              new Error(
                "Failed to receive a response from the server after multiple idle checks. The connection may have timed out or the server may be unresponsive",
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
            LootLabsUtils.decodePublisherLink(encodedPublisherLink);

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
    const id = url.search.split("?")[1];

    if (url.pathname !== "/s" || !id) {
      throw new MissingParameterError("s");
    }

    const { key, actions } = await this.fetchTaskActions(url);
    const urid = actions[0].urid;

    this.sendTelemetry(urid);

    const wsUrl = `${LootLabsService.WEBSOCKET_URL}?uid=${urid}&cat=14&key=${key}`;

    const shortenedUrl = await this.connectAndDecodePublisherLink(wsUrl);

    return shortenedUrl;
  }
}
