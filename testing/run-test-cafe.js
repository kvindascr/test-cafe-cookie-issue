const createTestCafe = require('testcafe');

const testCafeOptions = {
  // hostname: Enables the use of devices on insecure http://localhost:3000
  hostname: 'localhost',
};

const main = async () => {
  const shouldUseCloud = process.argv.includes('--cloud');
  const shouldUseChromium = process.argv.includes('--chromium');
  const shouldUseLiveMode = process.argv.includes('--live');

  const testcafe = await createTestCafe(testCafeOptions);
  const runner = shouldUseLiveMode ? testcafe.createLiveModeRunner() : testcafe.createRunner();
  const browser = shouldUseChromium ? 'chromium' : 'chrome';
  const userProfile = '--incognito';

  const browserArgs = `${browser} --allow-insecure-localhost ${userProfile}`;

  const numFailedTests = await runner.src('e2e').browsers(browserArgs).concurrency(1).run({ skipJsErrors: true });
  await testcafe.close();

  if (numFailedTests > 0) {
    process.exit(1);
  }
};

main();
