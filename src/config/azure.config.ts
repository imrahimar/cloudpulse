import { registerAs } from '@nestjs/config';

export default registerAs('azure', () => ({
  keyVaultUrl: process.env.AZURE_KEY_VAULT_URL,
  storageAccount: process.env.AZURE_STORAGE_ACCOUNT,
  storageConnection: process.env.AZURE_STORAGE_CONNECTION,
  serviceBusConnection: process.env.AZURE_SERVICE_BUS_CONNECTION,
  appInsightsKey: process.env.AZURE_APPINSIGHTS_KEY,
}));