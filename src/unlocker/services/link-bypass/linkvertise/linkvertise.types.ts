export type AccountResponse = {
  success: boolean;
  error: boolean;
  user_token: string;
};

export type DetailPageContentResponse = {
  data: {
    getDetailPageContent: {
      access_token: string;
      premium_subscription_active: string | null;
      link: {
        is_premium_only_link: boolean;
        last_edit_at: Date;
      };
    };
  };
};

export type CompleteDetailPageContentResponse = {
  data: {
    completeDetailPageContent: {
      TARGET: string;
      additional_target_access_information: {
        remaining_waiting_time: string;
        has_long_paywall_duration: string;
      };
    };
  };
};

export type GetDetailPageTargetResponse = {
  data: {
    getDetailPageTarget: {
      type: "URL" | "PASTE";
      url: string | null;
      paste: string | null;
    };
  };
};
