import { IsUrl } from "class-validator";

export class UnlockLinkDto {
  @IsUrl()
  link: string;
}
