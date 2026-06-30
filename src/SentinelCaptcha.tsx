import { useEffect, useRef } from "react";
import { loadSentinelScript } from "./loadSentinelScript";
import {
  DEFAULT_BASE_URL,
  type SentinelCaptchaProps,
  type SentinelSolvedDetail,
} from "./types";

/**
 * <SentinelCaptcha /> — renders the Redeyed Sentinel CAPTCHA widget.
 *
 * The widget script (`{baseUrl}/sentinel.js`) is injected once per page, then
 * Sentinel hydrates the `.sentinel-captcha` div. When the user solves the
 * challenge, the widget injects a hidden `sentinel-token` input AND dispatches
 * a bubbling `sentinel:solved` CustomEvent carrying the token.
 *
 * IMPORTANT: the token returned here is only HALF the flow — you must POST it
 * to YOUR own server and verify it against the Sentinel API using your secret
 * API key. Never verify (or expose the API key) in the browser.
 *
 * @example
 * <SentinelCaptcha
 *   siteKey={process.env.REACT_APP_SENTINEL_SITE_KEY!}
 *   onVerify={(token) => setToken(token)}
 * />
 */
export function SentinelCaptcha(props: SentinelCaptchaProps) {
  const {
    siteKey,
    widget,
    theme,
    scheme,
    baseUrl = DEFAULT_BASE_URL,
    onVerify,
    onError,
    className,
  } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Keep the latest callbacks in refs so the effect below doesn't re-run
  // (and re-inject the widget) every time a parent re-renders with new fns.
  const onVerifyRef = useRef(onVerify);
  const onErrorRef = useRef(onError);
  onVerifyRef.current = onVerify;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!siteKey) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    let cancelled = false;

    // Listen for the widget's solved event. The event bubbles, so listening on
    // the container catches it; we read the token from event.detail and fall
    // back to the hidden input the widget injects.
    const handleSolved = (event: Event) => {
      const detail = (event as CustomEvent<SentinelSolvedDetail>).detail;
      const token =
        detail?.token ??
        container.querySelector<HTMLInputElement>(
          'input[name="sentinel-token"]'
        )?.value ??
        "";

      if (token) {
        onVerifyRef.current?.(token);
      }
    };

    container.addEventListener("sentinel:solved", handleSolved as EventListener);

    loadSentinelScript(baseUrl).catch((err: unknown) => {
      if (cancelled) return;
      onErrorRef.current?.(
        err instanceof Error ? err : new Error(String(err))
      );
    });

    return () => {
      cancelled = true;
      container.removeEventListener(
        "sentinel:solved",
        handleSolved as EventListener
      );
    };
    // Re-run only when the rendered widget config actually changes.
  }, [siteKey, widget, theme, scheme, baseUrl]);

  // Required prop guard: render nothing + warn.
  if (!siteKey) {
    // eslint-disable-next-line no-console
    console.warn(
      "[@redeyed/sentinel-react] `siteKey` is required — rendering nothing. " +
        "Get a free key at https://redeyed.com/developers"
    );
    return null;
  }

  const classes = className
    ? `sentinel-captcha ${className}`
    : "sentinel-captcha";

  return (
    <div
      ref={containerRef}
      className={classes}
      data-sitekey={siteKey}
      {...(widget ? { "data-widget": widget } : {})}
      {...(theme ? { "data-theme": theme } : {})}
      {...(scheme ? { "data-scheme": scheme } : {})}
    />
  );
}

export default SentinelCaptcha;
