import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from "axios";
import * as https from "https";
import { HttpsProxyAgent } from "https-proxy-agent";

export class HttpClient {
  private readonly axiosInstance: AxiosInstance;

  constructor(proxy?: string) {
    let httpsAgent: https.Agent;

    if (proxy) {
      httpsAgent = new HttpsProxyAgent(proxy, {
        ciphers: "TLS_AES_128_GCM_SHA256",
      });
    } else {
      httpsAgent = new https.Agent({
        ciphers: "TLS_AES_128_GCM_SHA256",
      });
    }

    this.axiosInstance = axios.create({
      timeout: 5000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64; rv:135.0) Gecko/20100101 Firefox/135.0",
      },
      // Cloudflare can detect that Node.js is making the request, so simply change the cipher.
      httpsAgent,
    });
  }

  private async request<T>(
    method: Method,
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ) {
    const response: AxiosResponse<T> = await this.axiosInstance.request({
      method,
      url,
      data,
      ...config,
    });

    return response;
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>("GET", url, undefined, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>("POST", url, data, config);
  }

  async delete<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>("DELETE", url, data, config);
  }
}
