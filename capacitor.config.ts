import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.gocar',
  appName: 'GoCar',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;