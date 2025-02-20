export type TurnstileRequestParams = {
  websiteURL: string;
  websiteKey: string;
  proxyAddress?: string;
  htmlPageBase64?: string;
  userAgent?: string;
};

export interface CaptchaSolver {
  solveTurnstileCfClearance(task: TurnstileRequestParams): Promise<string>;
  getBalance(): Promise<number>;
}
