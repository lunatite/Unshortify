import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { AxiosErrorFilter } from "./filters/axios-error.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AxiosErrorFilter());
  app.setGlobalPrefix("/api");

  const port = configService.getOrThrow<number>("APP_PORT");
  await app.listen(port);
}
bootstrap();
