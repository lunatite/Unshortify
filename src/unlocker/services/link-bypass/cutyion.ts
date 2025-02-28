import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import * as cheerio from "cheerio";
import { SupportedHosts } from "src/unlocker/decorators/supported-hosts.decorator";
import { UnlockerResult, UnlockerService } from "../unlocker.type";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { extractCookiesFromHeaders } from "src/utils/extractCookiesFromHeaders";
import { CaptchaSolverFactory } from "src/captcha-solver/captcha-solver.factory";
import { CaptchaSolver } from "src/captcha-solver/captcha-solver.interface";
import { wait } from "src/utils/wait";

@Injectable()
@SupportedHosts(["cutyion.com", "cuty.io"])
export class CutyionService implements UnlockerService {
  public readonly name = "Cutyion";
  public readonly captchaSolver: CaptchaSolver;

  public static readonly BASE_URL = "https://cutyion.com/";
  public static readonly INPUT_TOKEN_SELECTOR = "input[name='_token']";
  public static readonly INPUT_DATA_SELECTOR = "input[name='data']";
  public static readonly RECAPTCHA_SITE_KEY =
    "6LdOhYIeAAAAAMqvDscr3FxQ3zZdIAYdwoSI7Jau";
  public static readonly LINK_PREPARED_IN_SECS = 8;

  constructor(
    private readonly httpService: HttpService,
    captchaSolverFactory: CaptchaSolverFactory,
  ) {
    this.captchaSolver = captchaSolverFactory.getSolver("capmonster");
  }

  private async fetchTokenAndCookies(id: string) {
    const url = CutyionService.BASE_URL + id;
    const { data, headers } = await this.httpService.axiosRef.get(url);
    const $ = cheerio.load(data);
    const token = $(CutyionService.INPUT_TOKEN_SELECTOR).attr("value");
    const cookies = extractCookiesFromHeaders(headers);

    if (!token) {
      throw new Error(
        "Failed to extract _token. The expected script may have changed or is missing from the HTML",
      );
    }

    return {
      token,
      cookies,
    };
  }

  private async solveCaptcha(id: string, token: string, cookies: string) {
    const url = CutyionService.BASE_URL + id;

    const gRecaptchaResponse =
      await this.captchaSolver.solveRecaptchaV2Proxyless({
        websiteURL: url,
        websiteKey: CutyionService.RECAPTCHA_SITE_KEY,
      });

    const formData = new FormData();
    formData.append("_token", token);
    formData.append("g-recaptcha-response", gRecaptchaResponse);

    const response = await this.httpService.axiosRef.post(url, formData, {
      headers: { Cookie: cookies },
    });
    const $ = cheerio.load(response.data);
    const extractedData = $(CutyionService.INPUT_DATA_SELECTOR).attr("value");

    if (!extractedData) {
      throw new Error(
        "Failed to extract data. The expected script may have changed or is missing from the HTML",
      );
    }

    return extractedData;
  }

  private async checkCaptchaRequirement(
    id: string,
    token: string,
    cookies: string,
  ) {
    const url = CutyionService.BASE_URL + id;
    const formData = new FormData();

    formData.append("_token", token);

    const response = await this.httpService.axiosRef.post(url, formData, {
      headers: {
        Cookie: cookies,
      },
    });

    const finalUrl = response?.request?.res?.responseUrl ?? "";

    return {
      url: finalUrl,
      isCaptchaRequired: finalUrl === url || !finalUrl,
    };
  }

  private async getFinalUnlockedLink(
    id: string,
    token: string,
    data: string,
    cookies: string,
  ) {
    const formData = new FormData();
    formData.append("_token", token);
    formData.append("data", data);

    const goUrl = `${CutyionService.BASE_URL}go/${id}`;

    await wait(CutyionService.LINK_PREPARED_IN_SECS * 1000);

    const response = await this.httpService.axiosRef.post(goUrl, formData, {
      headers: {
        Cookie: cookies,
      },
      maxRedirects: 5,
    });

    const unlockedLink = response?.request?.res?.responseUrl ?? "";

    if (!unlockedLink) {
      throw new Error("Failed to retrieve the final unlocked link");
    }

    return unlockedLink;
  }

  async unlock(
    url: URL,
    metadata?: Record<string, unknown>,
  ): Promise<UnlockerResult> {
    const parts = url.pathname.split("/").filter(Boolean);

    if (parts.length !== 1) {
      throw new InvalidPathException("/{id}");
    }

    const id = parts[0];
    const { token, cookies } = await this.fetchTokenAndCookies(id);
    const { isCaptchaRequired, url: finalUrl } =
      await this.checkCaptchaRequirement(id, token, cookies);

    if (!isCaptchaRequired) {
      return {
        type: "url",
        content: finalUrl,
      };
    }

    const data = await this.solveCaptcha(id, token, cookies);
    const unlockedLink = await this.getFinalUnlockedLink(
      id,
      token,
      data,
      cookies,
    );

    return {
      type: "url",
      content: unlockedLink,
    };
  }
}
