type UnlockerType = "url" | "paste" | "whitelist";

export type UnlockerResult = {
  type: UnlockerType;
  content: string;
};

export type UnlockerService = {
  name: string;
  unlock(url: URL, metadata?: Record<string, unknown>): Promise<UnlockerResult>;
};
