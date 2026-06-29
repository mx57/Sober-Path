const { withAndroidManifest } = require('@expo/config-plugins');

const withAndroidFixes = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults.manifest;
    const mainApplication = androidManifest.application[0];

    // Ensure tools namespace exists
    if (!androidManifest.$['xmlns:tools']) {
      androidManifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    // Attributes to replace to avoid manifest merger conflicts
    const replaces = ['android:icon', 'android:roundIcon', 'android:allowBackup', 'android:supportsRtl'];

    let currentReplace = mainApplication.$['tools:replace'] || '';
    let replaceArray = currentReplace ? currentReplace.split(',').map(s => s.trim()) : [];

    replaces.forEach(r => {
      if (!replaceArray.includes(r)) {
        replaceArray.push(r);
      }
    });

    mainApplication.$['tools:replace'] = replaceArray.join(',');

    return config;
  });
};

module.exports = withAndroidFixes;
