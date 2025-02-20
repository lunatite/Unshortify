type ParsedProxy = {
  protocol: ProxyProtocol;
  host: string;
  port: number;
  username?: string;
  password?: string;
};

type ProxyProtocol = "http" | "https" | "socks4" | "socks5";

function parseProxyAddress(proxy: string): ParsedProxy {
  const regex = /^(https?|socks5?):\/\/(?:(\w+):(\w+)@)?([\w.-]+):(\d+)$/;
  const match = proxy.match(regex);

  if (!match) {
    throw new Error("Invalid proxy format");
  }

  const [, protocol, username, password, host, port] = match;

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
    username,
    password,
  };
}
