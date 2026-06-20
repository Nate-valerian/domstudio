# DomStudio Mobile

Expo/React Native shell for DomStudio.

Pinned to Expo SDK 54 for compatibility with App Store Expo Go on older iOS
devices such as iPhone 8 Plus.

## Setup

```bash
npm install
cp .env.example .env
npm run start
```

Set `EXPO_PUBLIC_API_URL` to the backend reachable from the device:

- iOS simulator: `http://localhost:8000`
- Android emulator: `http://10.0.2.2:8000`
- physical phone: your computer LAN IP, for example `http://192.168.1.20:8000`

## Current Scope

- Email login against `/auth/login/email`
- Email registration and email OTP verification
- Phone OTP login
- Forgot/reset password
- Secure token storage
- Token refresh on app boot
- Account load from `/users/me/full`
- Product camera capture and gallery picker
- Image generation through `/generation/generate`
- Video job queueing and job list refresh through `/generation/video` and `/generation/jobs`
- Native share sheet and save-to-gallery for generated results
- Persistent local native history
- Native bottom-tab navigation
- Offline/auth/loading/empty states
- Account usage limits and settings screens

Paid plans, final app icon/splash assets, store compliance, and real generation/video quality testing are next-pass items.
