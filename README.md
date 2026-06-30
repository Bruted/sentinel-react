# @redeyed_/sentinel-react

React component for the **Redeyed Sentinel** CAPTCHA — privacy-friendly bot
detection that's **free to use** (you just need a free site key + API key).

Get your keys at **<https://redeyed.com/developers>**.

## Install

```bash
npm i @redeyed_/sentinel-react
```

> This package ships TypeScript/TSX source under `src/`. Most bundlers
> (Vite, Next.js, CRA, Webpack 5, esbuild) compile it for you out of the box.
> If your setup doesn't transpile `node_modules`, add a small build step (e.g.
> `tsc`) that emits to `dist/` and point your import there.

## Usage

```tsx
import { useState } from "react";
import { SentinelCaptcha } from "@redeyed_/sentinel-react";

export function SignupForm() {
  const [token, setToken] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Send the token to YOUR server, which verifies it with your secret API key.
    await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, /* ...form fields */ }),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* ...your fields... */}
      <SentinelCaptcha
        siteKey={import.meta.env.VITE_SENTINEL_SITE_KEY}
        onVerify={setToken}
        onError={(err) => console.error(err)}
      />
      <button type="submit" disabled={!token}>
        Sign up
      </button>
    </form>
  );
}
```

### Hook alternative

If you'd rather pull the token from a hook than wire `onVerify`:

```tsx
import { SentinelCaptcha, useSentinelToken } from "@redeyed_/sentinel-react";

function Widget() {
  const token = useSentinelToken(); // latest token solved on the page
  return <SentinelCaptcha siteKey="YOUR_SITE_KEY" />;
}
```

## Props

| Prop        | Type                      | Required | Description                                                      |
| ----------- | ------------------------- | :------: | ---------------------------------------------------------------- |
| `siteKey`   | `string`                  |    yes   | Public site key. If missing, renders nothing + `console.warn`.   |
| `onVerify`  | `(token: string) => void` |    no    | Called with the verification token once solved.                  |
| `onError`   | `(error: Error) => void`  |    no    | Called if the Sentinel script fails to load.                     |
| `widget`    | `string`                  |    no    | Widget variant (`data-widget`).                                  |
| `theme`     | `string`                  |    no    | Theme name (`data-theme`).                                       |
| `scheme`    | `string`                  |    no    | Color scheme, e.g. `"light"` / `"dark"` (`data-scheme`).         |
| `baseUrl`   | `string`                  |    no    | Asset/script base URL. Defaults to `https://redeyed.com`.        |
| `className` | `string`                  |    no    | Extra class on the container (alongside `sentinel-captcha`).     |

## Verifying on your server (required)

The token from `onVerify` only proves the widget was solved in the browser —
you **must** verify it server-side. **Your API key is secret and must never be
shipped to the browser.**

```http
POST https://redeyed.com/api/v1/verify
X-Api-Key: <YOUR_SECRET_API_KEY>
Content-Type: application/json
Accept: application/json

{ "site_key": "<YOUR_SITE_KEY>", "token": "<token-from-onVerify>" }
```

The check **passes** when the JSON response has `data.success === true`
(or top-level `success === true`).

> Using Next.js? `@redeyed_/sentinel-nextjs` ships a ready-made `verifySentinel()`
> server helper.

## License

MIT © 2026 Redeyed Corporation
