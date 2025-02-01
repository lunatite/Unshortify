import { Injectable } from "@nestjs/common";
import axios from "axios";
import * as cheerio from "cheerio";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { BypassLinkNotFoundException } from "../exceptions/bypass-link-not-found.exception";
import { extractCookiesFromHeaders } from "src/utils/extractCookiesFromHeaders";

export type Sub2UnlockResponse = {
  status: "success" | "error";
  message: string;
  url: string;
};

@Injectable()
export class Sub2UnlockService implements LinkProcessorHandler {
  public readonly name = "Sub2Unlock";

  private extractFormValues(html: string) {
    const $ = cheerio.load(html);

    return {
      ref: ($("input[name='ref']").val() as string) || "",
      f_n: ($("input[name='f_n']").val() as string) || "",
      csrfToken: ($("input[name='_csrfToken']").val() as string) || "",
      tokenFields:
        ($("input[name='_Token\\[fields\\]']").val() as string) || "",
      tokenUnlocked:
        ($("input[name='_Token\\[unlocked\\]']").val() as string) || "",
      ad_form_data: ($("input[name='ad_form_data']").val() as string) || "",
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

    return axios.post<T>(url, params, {
      headers,
    });
  }

  async resolve(url: URL) {
    if (url.pathname === "/") {
      throw new InvalidPathException("/{id}");
    }

    const { data: htmlContent, headers } = await axios.get(url.href);
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
      "https://sub2unlock.me/links/go",
      urlParams2,
      finalCookies,
      true,
    );

    if (apiData.status === "error") {
      throw new BypassLinkNotFoundException();
    }

    return apiData.url;
  }
}
