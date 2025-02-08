import { HttpService } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { LinkvertiseService } from "./linkvertise.service";
import { LinkvertiseSession } from "./linkvertise.session";

@Module({
  providers: [
    {
      provide: LinkvertiseSession,
      useFactory: async (httpService: HttpService) => {
        const session = new LinkvertiseSession(httpService);
        await session.initialize(
          "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3B1Ymxpc2hlci5saW5rdmVydGlzZS5jb20vYXBpL3YxL2F1dGgvbG9naW4iLCJpYXQiOjE3Mzg5NjgwODUsIm5iZiI6MTczODk2ODA4NSwianRpIjoiTzNEVlNsS1htODV3TmdIMSIsInN1YiI6NTQ5MDMxMiwicHJ2IjoiN2IzZmVmNDNmOTgxZTE3Nzc5MGQwMGJkZjQ1M2ZhZGM3NzNmNzI4YyJ9.FywG3D5ACzeicrT630FEqtfyJL0JdZGWzJoXUUss7YU",
        );

        return session;
      },
      inject: [HttpService],
    },
    LinkvertiseService,
  ],
  exports: [LinkvertiseService, LinkvertiseSession],
})
export class LinkvertiseModule {}
