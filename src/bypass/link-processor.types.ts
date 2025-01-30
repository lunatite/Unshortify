export type LinkProcessorHandler = {
  name: string;
  resolve: (url: URL) => Promise<string>;
};
