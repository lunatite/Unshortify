import { plainToClass, Transform } from "class-transformer";
import {
  IsEnum,
  IsNumber,
  Min,
  Max,
  validateSync,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
} from "class-validator";
import { CaptchaProvider } from "./captcha/captcha-provider.enum";

enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
  Provision = "provision",
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  APP_PORT: number;

  @IsString()
  @IsNotEmpty()
  REDIS_HOST: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  REDIS_PORT: number;

  @IsOptional()
  @IsString()
  REDIS_USERNAME: string;

  @IsOptional()
  @IsString()
  REDIS_PASSWORD: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ obj, key }) => obj[key] === "true")
  CACHE_ENABLED: boolean;

  @IsNumber()
  @Min(0)
  CACHE_TTL: number;

  @IsOptional()
  @IsString()
  LINKVERTISE_ACCESS_TOKEN: string;

  @IsOptional()
  @IsString()
  HTTP_PROXY: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsEnum(CaptchaProvider)
  CAPTCHA_PROVIDER: CaptchaProvider;

  @IsOptional()
  @IsString()
  TURNSTILE_SECRET_KEY: string;

  @IsOptional()
  @IsString()
  TURNSTILE_SITE_KEY: string;

  @IsOptional()
  @IsString()
  CAPMONSTER_CLIENT_KEY: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
