import { randomUUID } from "crypto";

export class LinkvertiseUtils {
  static createActionId() {
    let actionId = "";

    for (let i = 0; i < 3; i++) {
      actionId += randomUUID();
    }

    return actionId.slice(0, 100);
  }
}
