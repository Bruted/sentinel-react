/**
 * Shared types for the Redeyed Sentinel CAPTCHA React bindings.
 */

/** Default Redeyed base URL. Override via the `baseUrl` prop for self-hosted / staging. */
export const DEFAULT_BASE_URL = "https://redeyed.com";

/**
 * The `event.detail` payload dispatched by the Sentinel widget on the
 * bubbling `sentinel:solved` CustomEvent.
 */
export interface SentinelSolvedDetail {
  /** The verification token to send to YOUR server for verification. */
  token: string;
}

export interface SentinelCaptchaProps {
  /**
   * Your public Sentinel site key. REQUIRED.
   * Get one (free) at https://redeyed.com/developers.
   * If omitted, the component renders nothing and logs a console warning.
   */
  siteKey: string;

  /** Optional widget variant (maps to `data-widget` on the container div). */
  widget?: string;

  /** Optional theme name (maps to `data-theme`). */
  theme?: string;

  /** Optional color scheme, e.g. "light" | "dark" (maps to `data-scheme`). */
  scheme?: string;

  /** Base URL for the Sentinel script + assets. Defaults to https://redeyed.com. */
  baseUrl?: string;

  /**
   * Called with the verification token once the user solves the challenge.
   * Send this token to YOUR server and verify it there (never in the browser).
   */
  onVerify?: (token: string) => void;

  /** Called if the Sentinel script fails to load. */
  onError?: (error: Error) => void;

  /** Optional className applied to the container div (alongside `sentinel-captcha`). */
  className?: string;
}
