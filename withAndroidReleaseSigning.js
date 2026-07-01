const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = addSigningConfig(config.modResults.contents);
    }
    return config;
  });
};

function addSigningConfig(content) {
  if (content.includes('release {')) {
    // 1. Add release signing config
    const signingConfig = `
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            storeFile file('release.keystore')
            storePassword 'android'
            keyAlias 'release'
            keyPassword 'android'
        }
    }`;

    content = content.replace(/signingConfigs\s*\{[^\}]+\}/s, signingConfig);

    // 2. Update release build type to use release signing config
    content = content.replace(
      /release\s*\{\s*(\/\/.*?\s*)?signingConfig\s+signingConfigs\.debug/s,
      'release {\n            signingConfig signingConfigs.release'
    );
  }
  return content;
}
