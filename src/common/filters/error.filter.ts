import { ArgumentsHost, ExceptionFilter, Catch } from "@nestjs/common";
import { Response } from "express";

@Catch(Error)
export class ErrorFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    return response.status(400).json({
      message: exception.message,
      error: "Bad Request",
      statusCode: 400,
    });
  }
}
