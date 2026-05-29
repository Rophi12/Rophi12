# Toppily Agent Portal

A GitHub Pages and Netlify-ready static website inspired by the public pages at `agent.toppily.com`. It includes a home page, login page, registration page, responsive styling, simple client-side form feedback, and auth forms that are intentionally left for a secure backend integration instead of Netlify Forms.

## Pages

- `/` — landing page with navigation, hero section, features, and call-to-action.
- `/login/` or `/login/index.html` — sign-in form with password reset modal forms.
- `/register/` or `/register/index.html` — account creation form with field guidance and validation. Demo registrations are stored in browser `localStorage` for the admin preview.
- `/admin/` or `/admin/index.html` — static admin portal for reviewing demo users and toggling feature availability.

## Admin portal

The admin page is a static preview that works on GitHub Pages without a server. Sign in with the configured admin email and password, then approve, suspend, or delete demo registrations and toggle feature flags. The password is checked from a client-side SHA-256 digest rather than stored as plaintext, but this is still not production authentication. Connect a server-side auth and database layer before managing real users.

## Deploy to GitHub Pages

1. Run `npm run build`.
2. Enable GitHub Pages with GitHub Actions; `.github/workflows/pages.yml` builds and publishes `dist` on pushes to `main`.
3. You can also publish the `dist` folder manually from any static host. Keep `dist/.nojekyll` so GitHub serves the copied assets and directories without Jekyll processing.
4. Replace the placeholder WhatsApp, Telegram, admin, and authentication form handling with your real production services.

## Deploy to Netlify

1. Import this repository into Netlify.
2. Keep the build command as `npm run build`.
3. Keep the publish directory as `dist`.
4. If you deploy by dragging and dropping files into Netlify, upload the generated `dist` folder so Netlify receives the included `_redirects` file. The navigation also points to explicit `index.html` files, so `/login/index.html`, `/register/index.html`, and `/admin/index.html` open even on hosts that do not support pretty directory URLs.
5. Replace the placeholder WhatsApp, Telegram, admin, and authentication form handling with your real production services. Do not enable Netlify Forms for login, registration, OTP, admin, or password-reset forms because those flows can contain credentials or security codes.

## Local commands

```bash
npm run build
npm run check
python3 -m http.server 4173 -d dist
```
