import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { AxiosResponse } from "axios";

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

@Injectable()
export class FastApiCurlProxyService {
  private static readonly BASE_URL = "http://fastapi-curl-proxy:8001";

  constructor(private readonly httpService: HttpService) {}

  private request<T>(
    data: FastApiCurlProxyRequest,
  ): Promise<AxiosResponse<FastApiCurlProxyResponse<T>>> {
    return this.httpService.axiosRef.post<FastApiCurlProxyResponse<T>>(
      FastApiCurlProxyService.BASE_URL,
      data,
      {
        timeout: 5000,
        httpsAgent: undefined,
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
