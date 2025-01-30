export type BypassLinkService = {
  name: string;
  bypass: (url: URL) => Promise<string>;
};
