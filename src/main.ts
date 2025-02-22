import "./instrument";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { join } from "path";
import * as Handlebars from "handlebars";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { AxiosErrorFilter } from "./common/filters/axios-error.filter";
import { ErrorFilter } from "./common/filters/error.filter";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.useStaticAssets(join(__dirname, "..", "public"));
  app.setBaseViewsDir(join(__dirname, "..", "views"));
  app.setViewEngine("hbs");

  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AxiosErrorFilter());
  app.useGlobalFilters(new AllExceptionsFilter());
  // app.useGlobalFilters(new ErrorFilter());

  const port = configService.getOrThrow<number>("APP_PORT");
  await app.listen(port);
}
bootstrap();
