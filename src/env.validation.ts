import { plainToClass } from "class-transformer";
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

  @IsBoolean()
  CACHE_ENABLED: boolean;

  @IsOptional()
  @IsString()
  LINKVERTISE_ACCESS_TOKEN: string;

  @IsOptional()
  @IsString()
  HTTP_PROXY: string;
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
