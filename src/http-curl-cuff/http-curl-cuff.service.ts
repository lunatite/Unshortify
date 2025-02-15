import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

type HttpCurlCuffData = {
  url: string;
  cookies?: Record<string, string>;
  method: "get" | "post" | "delete" | "put";
  impersonate?: string;
};

type HttpCurlCuffResponse<T> = {
  status_code: number;
  headers: Record<string, string>;
  data: T;
  cookies: Record<string, string>;
};

@Injectable()
export class HttpCurlCuffService {
  private readonly proxy;

  constructor(configService: ConfigService) {
    this.proxy = configService.get("HTTP_PROXY");
  }

  async request<T>(data: HttpCurlCuffData) {
    const response = await axios.post<HttpCurlCuffResponse<T>>(
      "http://fastapi-curl-proxy:8001",
      {
        ...data,
        proxies: {
          all: this.proxy,
        },
      },
      {
        timeout: 5000,
        proxy: false,
      },
    );
    return response.data;
  }
}
