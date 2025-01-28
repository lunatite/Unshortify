export type LinkShortenerService = {
  name: string;
  bypass: (url: URL) => Promise<string>;
};
