# Toppily Agent Portal

A GitHub Pages and Netlify-ready static website inspired by the public pages at `agent.toppily.com`. It includes a home page, login page, registration page, responsive styling, simple client-side form feedback, and auth forms that are intentionally left for a secure backend integration instead of Netlify Forms. The same static files are also mirrored at the repository root so the site still opens if Netlify, GitHub Pages, or another static host is pointed at the root folder instead of `dist`.

## Pages

- `/` — landing page with navigation, hero section, features, and call-to-action.
- `/login/` or `/login/index.html` — sign-in form with password reset modal forms.
- `/register/` or `/register/index.html` — account creation form with field guidance and validation. Demo registrations are stored in browser `localStorage` for the admin preview.
- `/admin/` or `/admin/index.html` — static admin portal for reviewing demo users and toggling feature availability.

## Admin portal

The admin page is a static preview that works on GitHub Pages without a server. Sign in with the configured admin email and password, then approve, suspend, or delete demo registrations and toggle feature flags. New users created from the sign-up page are saved in browser `localStorage` with a password hash, and approved users can sign in from the login page in that same browser. The admin password is checked from a client-side SHA-256 digest rather than stored as plaintext, but this is still not production authentication. Connect a server-side auth and database layer before managing real users.

## Deploy to GitHub Pages

1. Run `npm run build`.
2. Enable GitHub Pages with GitHub Actions; `.github/workflows/pages.yml` builds and publishes `dist` on pushes to `main`.
3. You can also publish the repository root from GitHub Pages because `npm run build` refreshes root-level `index.html`, `login/`, `register/`, `admin/`, `assets/`, `_redirects`, and `.nojekyll` copies.
4. You can publish the `dist` folder manually from any static host. Keep `dist/.nojekyll` so GitHub serves the copied assets and directories without Jekyll processing.
5. Replace the placeholder WhatsApp, Telegram, admin, and authentication form handling with your real production services.

## Deploy to Netlify

1. Import this repository into Netlify.
2. Keep the build command as `npm run build`.
3. Keep the publish directory as `dist`.
4. If you deploy by dragging and dropping files into Netlify, upload the generated `dist` folder. If you accidentally upload the full repository/root folder instead, the root-level mirror files also include the same pages, assets, and `_redirects` file so the site still opens.
5. The navigation points to explicit `index.html` files, so `/login/index.html`, `/register/index.html`, and `/admin/index.html` open even on hosts that do not support pretty directory URLs.
6. Replace the placeholder WhatsApp, Telegram, admin, and authentication form handling with your real production services. Do not enable Netlify Forms for login, registration, OTP, admin, or password-reset forms because those flows can contain credentials or security codes.

## Local commands

```bash
npm run build
npm run check
python3 -m http.server 4173 -d dist
```
