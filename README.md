# Livo Mobile

Livo is a private, local-first iPhone and Android app. Records, money statements, and reminder history are stored in SQLite on the phone. The app has no AI, backend, account, advertising, or subscription.

## Local development

```sh
npm install
npx expo start
```

Scan the QR code with Expo Go for a quick UI preview. Native local notifications and final store testing should use a development or preview build.

## Store builds

After signing in to an Expo account and connecting the store accounts:

```sh
npx eas-cli@latest build --platform all --profile production
```

The same TypeScript codebase produces an Android App Bundle for Google Play and an iOS archive for TestFlight/App Store. Apple and Google developer memberships are required for store submission.

## Local data

The database is embedded inside the installed app. Uninstalling Livo deletes its local data unless the user has an OS or future in-app backup/export.
