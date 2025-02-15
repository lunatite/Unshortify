import { Global, Module } from "@nestjs/common";
import { HttpCurlCuffService } from "./http-curl-cuff.service";

@Global()
@Module({
  providers: [HttpCurlCuffService],
  exports: [HttpCurlCuffService],
})
export class HttpCurlCuffModule {}
