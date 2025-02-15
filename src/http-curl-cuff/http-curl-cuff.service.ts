import { Injectable } from "@nestjs/common";
import axios from "axios";

type HttpCurlCuffData = {
  url: string;
  cookies?: Record<string, string>;
  method: "get" | "post" | "delete" | "put";
  proxies?: Record<"all" | "http" | "https", string>;
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
  async request<T>(data: HttpCurlCuffData) {
    const response = await axios.post<HttpCurlCuffResponse<T>>(
      "http://fastapi-curl-proxy:8001",
      data,
      {
        timeout: 5000,
        proxy: false,
      },
    );
    return response.data;
  }
}
