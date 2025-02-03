import { Injectable, Scope } from "@nestjs/common";
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from "axios";

@Injectable({
  scope: Scope.TRANSIENT,
})
export class HttpClientService {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 5000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64; rv:135.0) Gecko/20100101 Firefox/135.0",
      },
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
