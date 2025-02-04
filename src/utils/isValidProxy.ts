const proxyRegex = /^(https?:\/\/)?([^@:]+):([^@]+)@([a-zA-Z0-9.-]+):(\d+)$/;

export function isValidProxy(line: string): boolean {
  return proxyRegex.test(line);
}
