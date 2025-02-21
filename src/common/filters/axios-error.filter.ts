import {
  ArgumentsHost,
  ExceptionFilter,
  Catch,
  BadRequestException,
} from "@nestjs/common";
import { Response } from "express";
import { AxiosError } from "axios";

@Catch(AxiosError)
export class AxiosErrorFilter implements ExceptionFilter {
  catch(exception: AxiosError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isDev = process.env.NODE_ENV === "development";

    if (exception.response?.status === 404) {
      throw new BadRequestException("The requested resource cannot be found");
    }

    const errorResponse: Record<string, any> = {
      message: "External API Error",
      error: "Bad Gateway",
      statusCode: 502,
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
