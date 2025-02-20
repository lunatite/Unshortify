import { Module } from "@nestjs/common";
import { CaptchaSolverFactory } from "./captcha-solver.factory";
import { CapMonsterSolverService } from "./services/capmonster.service";

@Module({
  providers: [CaptchaSolverFactory, CapMonsterSolverService],
  exports: [CaptchaSolverFactory],
})
export class CaptchaSolverModule {}
