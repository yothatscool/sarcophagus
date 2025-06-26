import { testAllApiIntegrations, demonstrateProtocolIntegration } from './test-api-integration';

(async () => {
  await testAllApiIntegrations();
  await demonstrateProtocolIntegration();
})(); 