import { Catch, ArgumentsHost } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { SentryExceptionCaptured } from "@sentry/nestjs";

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  @SentryExceptionCaptured()
  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);
  }
}
