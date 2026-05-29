# Toppily Agent Portal

A Netlify-ready static website inspired by the public pages at `agent.toppily.com`. It includes a home page, login page, registration page, responsive styling, simple client-side form feedback, and auth forms that are intentionally left for a secure backend integration instead of Netlify Forms.

## Pages

- `/` — landing page with navigation, hero section, features, and call-to-action.
- `/login/` — sign-in form with password reset modal forms.
- `/register/` — account creation form with field guidance and validation.

## Deploy to Netlify

1. Import this repository into Netlify.
2. Keep the build command as `npm run build`.
3. Keep the publish directory as `dist`.
4. Replace the placeholder WhatsApp, Telegram, and authentication form handling with your real production services. Do not enable Netlify Forms for login, registration, OTP, or password-reset forms because those flows can contain credentials or security codes.

## Local commands

```bash
npm run build
npm run check
python3 -m http.server 4173 -d dist
```
