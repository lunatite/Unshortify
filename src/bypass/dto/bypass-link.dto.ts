import { IsUrl } from "class-validator";

export class BypassLinkDto {
  @IsUrl()
  url: string;
}
