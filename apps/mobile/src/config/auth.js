/** Auth is bypassed only during local development, never in production builds. */
export function isAuthTemporarilyDisabled() {
  return __DEV__ || process.env.EXPO_PUBLIC_AUTH_BYPASS === "true";
}
