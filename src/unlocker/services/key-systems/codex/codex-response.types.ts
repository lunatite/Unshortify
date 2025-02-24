export type Stage = {
  uuid: string;
  name: "loot-link" | "loot-links" | "linkvertise";
  title: string;
  description: string;
};

export type GetStagesResponse = {
  success: boolean;
  streak: boolean;
  authenticated?: boolean;
  stages?: Array<Stage>;
};

export type InitStageResponse = {
  success: boolean;
  token?: string;
};

export type StagePayload = {
  stage: string;
  hwid: string;
  id: string;
  link: string;
  status: number;
  iat: number;
  exp: number;
};

export type ValidStageTokenResponse = {
  success: boolean;
  token: string;
};
