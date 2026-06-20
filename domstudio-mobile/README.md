# DomStudio Mobile

Expo/React Native shell for DomStudio.

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
- Secure token storage
- Account load from `/users/me/full`
- Product photo picker
- Image generation through `/generation/generate`
- Native share sheet for generated results
- In-session native history

Video, registration/OTP, paid plans, and persistent native history are next-pass items.

