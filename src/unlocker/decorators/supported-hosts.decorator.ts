import { SetMetadata } from "@nestjs/common";

export const SupportedHosts = (hostnames: string[]) => {
  return SetMetadata("supportedHosts", hostnames);
};
