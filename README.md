# Livo Mobile

Livo is a private, local-first iPhone and Android app. Records, money statements, and reminder history are stored in SQLite on the phone. The app has no AI, backend, account, advertising, or subscription.

## Before you start

Run every command below from this folder:

```powershell
cd "C:\Users\Rahul\OneDrive\Documents\ChatGPT\New project\LivoMobile"
```

Install dependencies once after downloading or cloning the project:

```powershell
npm install
```

## Test on an iPhone now

1. Install **Expo Go** from the iPhone App Store.
2. Put the iPhone and Windows PC on the same Wi-Fi network, or use the tunnel command below.
3. Start the app:

```powershell
npx expo start --clear --tunnel
```

4. Force-close Expo Go, reopen it, and scan the new QR code with the iPhone camera.

To stop the development server, press `Ctrl + C` in PowerShell.

> Expo Go is for testing. A standalone iPhone app for TestFlight/App Store is created with the production build commands below.

## Test on an Android phone now

1. Install **Expo Go** from Google Play.
2. Start the project:

```powershell
npx expo start --clear --tunnel
```

3. Scan the QR code from Expo Go.

## Build an installable Android APK

An APK can be installed directly on an Android phone. Sign in to Expo first:

```powershell
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform android --profile preview
```

Expo creates the APK in its cloud build service. When the build finishes, open the build-details URL printed in PowerShell, download the APK, send it to the Android phone, and install it.

You can download a completed Android build again with:

```powershell
npx eas-cli@latest build:download --platform android
```

## Build for Google Play

Google Play uses an Android App Bundle (`.aab`), not an APK. A Google Play developer account is required.

```powershell
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile production
npx eas-cli@latest submit --platform android --profile production
```

## Build for TestFlight and the Apple App Store

An Apple Developer Program membership is required. Expo will guide you through Apple signing credentials after you run the build command.

```powershell
npx eas-cli@latest login
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios --profile production
```

After the upload completes, use App Store Connect to add the build to TestFlight and then submit it to App Review.

## Build both store versions

After both developer accounts are configured, create Android and iPhone production builds together:

```powershell
npx eas-cli@latest build --platform all --profile production
```

## Troubleshooting Expo Go / Metro

If Expo Go displays a Metro cache error, stop the server with `Ctrl + C` and restart it:

```powershell
npx expo start --clear --tunnel
```

If the error persists, remove Expo's local cache and retry:

```powershell
Remove-Item -LiteralPath .expo -Recurse -Force
npx expo start --clear --tunnel
```

## Local data

The database is embedded inside the installed app. Uninstalling Livo deletes its local data unless the user has an OS or future in-app backup/export.
