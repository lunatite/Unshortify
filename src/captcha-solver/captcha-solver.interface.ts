export type TurnstileRequestParams = {
  websiteURL: string;
  websiteKey: string;
  proxyAddress?: string;
  htmlPageBase64?: string;
  userAgent?: string;
};

export type RecaptchaV2ProxylessRequestParams = {
  websiteURL: string;
  websiteKey: string;
  recaptchaDataSValue?: string;
};

export interface CaptchaSolver {
  solveTurnstileCfClearance(task: TurnstileRequestParams): Promise<string>;
  solveRecaptchaV2Proxyless(
    task: RecaptchaV2ProxylessRequestParams,
  ): Promise<string>;
  getBalance(): Promise<number>;
}
