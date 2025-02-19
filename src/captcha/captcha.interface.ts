export type CaptchaVerificationResult = {
  success: boolean;
  errorCodes: string[];
};

export interface CaptchaService {
  verifyCaptcha(token: string, ip?: string): Promise<CaptchaVerificationResult>;
}
