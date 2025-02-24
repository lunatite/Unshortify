import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import * as cheerio from "cheerio";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { extractCookiesFromHeaders } from "src/utils/extractCookiesFromHeaders";
import { SupportedHosts } from "src/unlocker/decorators/supported-hosts.decorator";
import { UnlockerResult, UnlockerService } from "../unlocker.type";
import { UnlockedLinkNotFoundError } from "./errors/unlocked-link-not-found.error";

export type Sub2UnlockResponse = {
  status: "success" | "error";
  message: string;
  url: string;
};

@Injectable()
@SupportedHosts(["sub2unlock.me"])
export class Sub2UnlockService implements UnlockerService {
  public readonly name = "Sub2Unlock";

  private static readonly REF_SELECTOR = "input[name='ref']";
  private static readonly FN_SELECTOR = "input[name='f_n']";
  private static readonly CSRF_SELECTOR = "input[name='_csrfToken']";
  private static readonly TOKEN_FIELDS_SELECTOR =
    "input[name='_Token\\[fields\\]']";
  private static readonly TOKEN_UNLOCKED_SELECTOR =
    "input[name='_Token\\[unlocked\\]']";
  private static readonly AD_FORM_DATA = "input[name='ad_form_data']";

  private static readonly UNLOCK_URL = "https://sub2unlock.me/links/go";

  constructor(private readonly httpService: HttpService) {}

  private extractInputValue($: cheerio.CheerioAPI, selector: string) {
    const inputValue = ($(selector).val() as string) ?? "";
    return inputValue;
  }

  private extractFormValues(html: string) {
    const $ = cheerio.load(html);

    return {
      ref: this.extractInputValue($, Sub2UnlockService.REF_SELECTOR),
      f_n: this.extractInputValue($, Sub2UnlockService.FN_SELECTOR),
      csrfToken: this.extractInputValue($, Sub2UnlockService.CSRF_SELECTOR),
      tokenFields: this.extractInputValue(
        $,
        Sub2UnlockService.TOKEN_FIELDS_SELECTOR,
      ),
      tokenUnlocked: this.extractInputValue(
        $,
        Sub2UnlockService.TOKEN_UNLOCKED_SELECTOR,
      ),
      ad_form_data: this.extractInputValue($, Sub2UnlockService.AD_FORM_DATA),
    };
  }

  private async request<T>(
    url: string,
    params: URLSearchParams,
    cookies = "",
    useXmlHttpRequest?: boolean,
  ) {
    const headers: Record<string, string> = {
      Cookie: cookies,
    };

    if (useXmlHttpRequest) {
      headers["X-Requested-With"] = "XMLHttpRequest";
    }

    return this.httpService.axiosRef.post<T>(url, params, {
      headers,
    });
  }

  private async fetchUnlockedLink(url: URL) {
    const { data: htmlContent, headers } = await this.httpService.axiosRef.get(
      url.href,
    );
    const formValues = this.extractFormValues(htmlContent);

    const urlParams = new URLSearchParams({
      _method: "POST",
      _csrfToken: formValues.csrfToken,
      ref: formValues.ref,
      f_n: formValues.f_n,
      "_Token[fields]": formValues.tokenFields,
      "_Token[unlocked]": formValues.tokenUnlocked,
    });

    const cookies = extractCookiesFromHeaders(headers);

    const { data: htmlContent2, headers: headers2 } =
      await this.request<string>(url.href, urlParams, cookies);

    const formValues2 = this.extractFormValues(htmlContent2);
    const urlParams2 = new URLSearchParams({
      _method: "POST",
      _csrfToken: formValues2.csrfToken,
      ad_form_data: formValues2.ad_form_data,
      "_Token[fields]": formValues2.tokenFields,
      "_Token[unlocked]": formValues2.tokenUnlocked,
    });

    const finalCookies = `${cookies}; ${extractCookiesFromHeaders(headers2)}; ab=1`;

    const { data: apiData } = await this.request<Sub2UnlockResponse>(
      Sub2UnlockService.UNLOCK_URL,
      urlParams2,
      finalCookies,
      true,
    );

    if (apiData.status === "error") {
      throw new UnlockedLinkNotFoundError(url);
    }

    return apiData.url;
  }

  async unlock(url: URL): Promise<UnlockerResult> {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

    const unlockedLink = await this.fetchUnlockedLink(url);
    return {
      type: "url",
      content: unlockedLink,
    };
  }
}
