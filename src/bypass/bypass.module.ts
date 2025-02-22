import { Module } from "@nestjs/common";
import { CaptchaModule } from "src/captcha/captcha.module";
import { AdFocusService } from "./services/adfocus.service";
import { BoostInkService } from "./services/boostink.service";
import { LootLabsService } from "./services/lootlabs/lootlabs.service";
import { MBoostMeService } from "./services/mboostme.service";
import { Sub2GetService } from "./services/sub2get.service";
import { LinkvertiseService } from "./services/linkvertise.service";
import { RekoniseService } from "./services/rekonise.service";
import { Sub2UnlockService } from "./services/sub2unlock.service";
import { SubFinalService } from "./services/subfinal.service";
import { LinkProcessorService } from "./link-processer.service";
import { SocialWolvezService } from "./services/socialwolvez.service";
import { BypassController } from "./bypass.controller";
import { TinyUrlService } from "./services/tinyurl.service";
import { PasterSoService } from "./services/paster-so.service";
import { LinkUnlockerService } from "./services/linkunlocker.service";
import { CodexService } from "./services/codex/codex.service";
import { OuoService } from "./services/ouo.service";
import { DiscoveryModule } from "@nestjs/core";

@Module({
  imports: [CaptchaModule, DiscoveryModule],
  providers: [
    AdFocusService,
    BoostInkService,
    LootLabsService,
    MBoostMeService,
    Sub2GetService,
    LinkvertiseService,
    LinkProcessorService,
    RekoniseService,
    Sub2UnlockService,
    SocialWolvezService,
    SubFinalService,
    TinyUrlService,
    PasterSoService,
    LinkUnlockerService,
    CodexService,
    OuoService,
  ],
  controllers: [BypassController],
  exports: [LinkProcessorService],
})
export class BypassModule {}
