export type LootLabsTaskAction = {
  action_pixel_url: string;
  ad_url: string;
  urid: number;
  test_counter: number;
  time_to_complete: number;
  test_choose: number;
  tooltip: string;
  timer: number;
  session_id: number;
  new_tab: boolean;
  task_id: string;
  title: string;
  window_size: string;
  sub_title: string;
  icon: string;
  auto_complete_seconds: number;
};

export type LootLabsConfigKey =
  | "CDN_DOMAIN"
  | "TID"
  | "INCENTIVE_AVATAR"
  | "PUBLISHER_IMAGE"
  | "PUBLISHER_NAME"
  | "PUBLISHER_TITLE"
  | "KEY"
  | "SHOW_UNLOCKER"
  | "TIER_ID";
