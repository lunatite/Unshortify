import { Injectable } from "@nestjs/common";
import { CapMonsterSolverService } from "./services/capmonster.service";
import { CaptchaSolver } from "./captcha-solver.interface";

@Injectable()
export class CaptchaSolverFactory {
  constructor(private readonly capMonsterSolver: CapMonsterSolverService) {}

  getSolver(provider: "capmonster"): CaptchaSolver {
    switch (provider) {
      case "capmonster":
        return this.capMonsterSolver;
      default:
        throw new Error("Unsupported CAPTCHA provider");
    }
  }
}
