export type CaptchaVerificationResult = {
  success: boolean;
  errorCodes: string[];
  hostname?: string;
  action?: string;
};

export interface CaptchaService {
  verifyCaptcha(token: string, ip?: string): Promise<CaptchaVerificationResult>;
}
