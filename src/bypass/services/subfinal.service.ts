import { Injectable } from "@nestjs/common";
import axios from "axios";
import { LinkProcessorHandler } from "../link-processor.types";
import { InvalidPathException } from "src/common/errors/invalid-path.exception";
import { BypassLinkNotFoundException } from "../exceptions/bypass-link-not-found.exception";

@Injectable()
export class SubFinalService implements LinkProcessorHandler {
  public readonly name = "SubFinal";
  private readonly fileRegex = /window\.open\("(.*)","_self"\);/;

  async resolve(url: URL) {
    if (url.pathname === "/") {
      throw new InvalidPathException(
        "/SL/{id} or /S/FL.php?view={id} or /final.php?$={id}",
      );
    }

    let id = url.searchParams.get("view") || url.searchParams.get("$");

    if (!id) {
      const pathId = url.pathname.split("/SL/")[1];
      id = pathId || null;
    }

    if (!id) {
      throw new InvalidPathException(
        "/SL/{id} or /S/FL.php?view={id} or /final.php?$={id}",
      );
    }

    const { data: htmlContent } = await axios.get(
      `https://subfinal.com/final.php?$=${id}&own=owner`,
    );

    const fileRegexMatch = this.fileRegex.exec(htmlContent);

    if (!fileRegexMatch || fileRegexMatch[1] === undefined) {
      throw new BypassLinkNotFoundException();
    }

    const bypassedLink = fileRegexMatch[1];
    return bypassedLink;
  }
}
