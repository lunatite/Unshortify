import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from "@nestjs/common";
import { AxiosError } from "axios";

@Catch(AxiosError)
export class AxiosErrorFilter implements ExceptionFilter {
  catch(error: AxiosError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    const isProduction = process.env.NODE_ENV === "production";

    console.log(error);

    const errorResponse = {
      statusCode: status,
      error: isProduction ? "Internal Server Error" : "Axios Error",
      message: isProduction
        ? `An error occurred while processing your request. Please try again later.`
        : `Error processing request to URL: ${error.config.url} with message: ${error.message}`,
    };

    response.status(status).json(errorResponse);
  }
}
