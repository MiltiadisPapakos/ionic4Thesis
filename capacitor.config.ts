import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ionic4Thesis',
  webDir: 'www',
  bundledWebRuntime: false,
  plugins:{
    PushNotifications:{
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
