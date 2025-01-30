export type BypassLinkService = {
  name: string;
  resolve: (url: URL) => Promise<string>;
};
