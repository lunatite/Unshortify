import { HttpService } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LinkvertiseService } from "./linkvertise.service";
import { LinkvertiseSession } from "./linkvertise.session";

@Module({
  providers: [
    {
      provide: LinkvertiseSession,
      useFactory: async (
        httpService: HttpService,
        configService: ConfigService,
      ) => {
        const linkvertiseAccessToken = await configService.get(
          "LINKVERTISE_ACCESS_TOKEN",
        );

        if (linkvertiseAccessToken) {
          const session = new LinkvertiseSession(httpService);
          await session.initialize(linkvertiseAccessToken);
          return session;
        }

        return undefined;
      },
      inject: [HttpService, ConfigService],
    },
    LinkvertiseService,
  ],
  exports: [LinkvertiseService, LinkvertiseSession],
})
export class LinkvertiseModule {}
