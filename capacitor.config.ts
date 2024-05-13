import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ionic4Thesis',
  webDir: 'www',
  bundledWebRuntime: false,
  plugins:{
    PushNotifications:{
      presentationOptions: ["badge", "sound", "alert"]
    },
    "BarcodeScanner": {
      "ANDROID_PERMISSIONS": ["CAMERA"],
      "CAMERA_USAGE_DESCRIPTION": "This app needs camera access to scan QR codes"
    }
  }
};

export default config;
