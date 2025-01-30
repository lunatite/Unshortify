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

    response.status(status).json({
      statusCode: status,
      error: "Internal Server Error",
      message: `Error processing data for URL: ${error.config.url}`,
    });
  }
}
