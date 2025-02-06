export type AccountResponse = {
  user_token: string;
};

export type DetailPageContentResponse = {
  data: {
    getDetailPageContent: {
      access_token: string;
      premium_subscription_active: null;
      link: {
        is_premium_only_link: boolean;
        last_edit_at: string;
      };
    };
  };
};

export type CompleteDetailPageContentResponse = {
  data: {
    completeDetailPageContent: {
      CUSTOM_AD_STEP: string;
      TARGET: string;
      additional_target_access_information: {
        remaining_waiting_time: number;
        can_not_access: boolean;
        should_show_ads: boolean;
        has_long_paywall_duration: boolean;
      };
    };
  };
};

export type DetailPageTargetResponse = {
  data: {
    getDetailPageTarget: {
      type: "URL" | "PASTE";
      url: string | null;
      paste: string | null;
    };
  };
};
