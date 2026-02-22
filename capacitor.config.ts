import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.esystemlk.smartlabs',
  appName: 'SMARTLABS',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://registerapp-liart.vercel.app/',
  },
};

export default config;
