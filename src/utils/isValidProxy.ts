import { parseProxyAddress } from "./parseProxyAddress";

export function isValidProxy(proxy: string): boolean {
  try {
    parseProxyAddress(proxy);
    return true;
  } catch (error) {
    return false;
  }
}
