type ParsedProxy = {
  protocol: ProxyProtocol;
  host: string;
  port: number;
  username?: string;
  password?: string;
};

type ProxyProtocol = "http" | "https" | "socks4" | "socks5";

export function parseProxyAddress(proxy: string): ParsedProxy {
  const regex =
    /^(http|https|socks4|socks5):\/\/(?:([^:]+):([^@]+)@)?([^:]+):(\d+)$/;
  const match = proxy.match(regex);

  if (!match) {
    throw new Error("Invalid proxy format");
  }

  const [, protocol, username, password, host, port] = match;

  // Validate the protocol
  if (
    protocol !== "http" &&
    protocol !== "https" &&
    protocol !== "socks4" &&
    protocol !== "socks5"
  ) {
    throw new Error("Invalid proxy protocol");
  }

  return {
    protocol,
    host,
    port: parseInt(port, 10),
    username: username || undefined,
    password: password || undefined,
  };
}
