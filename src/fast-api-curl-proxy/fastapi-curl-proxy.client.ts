import axios, { AxiosInstance, AxiosResponse } from "axios";

export type FastApiCurlProxyRequest = {
  url: string;
  method: "get" | "post" | "delete" | "put";
  cookies?: Record<string, string>;
  data?: Record<string, any>;
  impersonate?: string;
  return_data?: boolean;
  headers?: Record<string, string>;
  proxies?: Record<string, string>;
};

export type FastApiCurlProxyResponse<T> = {
  status_code: number;
  headers: Record<string, string>;
  data: T;
  cookies: Record<string, string>;
  url: string;
};

export interface FastApiCurlProxyClientOptions
  extends Omit<FastApiCurlProxyRequest, "method" | "url"> {}

export class FastApiCurlProxyClient {
  private static readonly BASE_URL = "http://fastapi-curl-proxy:8001";
  private readonly axios: AxiosInstance;
  private readonly options: FastApiCurlProxyClientOptions;

  constructor(options: FastApiCurlProxyClientOptions) {
    this.options = options;

    this.axios = axios.create({
      baseURL: FastApiCurlProxyClient.BASE_URL,
      timeout: 5000,
      proxy: false,
    });
  }

  private request<T>(
    data: FastApiCurlProxyRequest,
  ): Promise<AxiosResponse<FastApiCurlProxyResponse<T>>> {
    return this.axios.post<FastApiCurlProxyResponse<T>>(
      FastApiCurlProxyClient.BASE_URL,
      {
        ...this.options,
        ...data,
        headers: {
          ...this.options.headers,
          ...data.headers,
        },
      },
    );
  }

  async get<T>(
    data: Omit<FastApiCurlProxyRequest, "method" | "data">,
  ): Promise<FastApiCurlProxyResponse<T>> {
    const response = await this.request<T>({ ...data, method: "get" });
    return response.data;
  }

  async post<T>(
    data: Omit<FastApiCurlProxyRequest, "method">,
  ): Promise<FastApiCurlProxyResponse<T>> {
    const response = await this.request<T>({ ...data, method: "post" });
    return response.data;
  }

  async delete<T>(
    data: Omit<FastApiCurlProxyRequest, "method">,
  ): Promise<FastApiCurlProxyResponse<T>> {
    const response = await this.request<T>({ ...data, method: "delete" });
    return response.data;
  }

  async put<T>(
    data: Omit<FastApiCurlProxyRequest, "method">,
  ): Promise<FastApiCurlProxyResponse<T>> {
    const response = await this.request<T>({ ...data, method: "put" });
    return response.data;
  }
}
