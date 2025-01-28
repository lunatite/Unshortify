import { IsUrl } from "class-validator";

export class LinkShortenerDto {
  @IsUrl()
  url: string;
}
