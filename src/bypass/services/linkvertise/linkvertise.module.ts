import { Module } from "@nestjs/common";
import { LinkvertiseService } from "./linkvertise.service";
import { LinkvertiseSession } from "./linkvertise.session";
import { HttpClient } from "src/http-client/http-client";

@Module({
  providers: [
    {
      provide: LinkvertiseSession,
      useFactory: async (httpClient: HttpClient) => {
        const session = new LinkvertiseSession(httpClient);
        await session.initialize("");

        return session;
      },
    },
    LinkvertiseService,
  ],
  exports: [LinkvertiseService, LinkvertiseSession],
})
export class LinkvertiseModule {}
