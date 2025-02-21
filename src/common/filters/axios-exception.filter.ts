import { ArgumentsHost, ExceptionFilter, Catch } from "@nestjs/common";
import { Response } from "express";
import { AxiosError } from "axios";

@Catch(AxiosError)
export class AxiosExceptionFilter implements ExceptionFilter {
  catch(exception: AxiosError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isDev = process.env.NODE_ENV === "development";

    const errorResponse: Record<string, any> = {
      message: "Bad Gateway - External API Error",
    };

    if (isDev) {
      errorResponse.detail = {
        code: exception.code,
        url: exception.config?.url,
        method: exception.config?.method,
        status: exception.response?.status,
        data: exception.response?.data,
      };
    } else {
      errorResponse.detail = null;
    }

    return response.status(502).json(errorResponse);
  }
}
