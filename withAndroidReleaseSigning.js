const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = addSigningConfig(config.modResults.contents);
    }
    return config;
  });
};

function findNamedBlock(content, blockName, fromIndex = 0) {
  const re = new RegExp(`${blockName}\\s*\\{`, 'g');
  re.lastIndex = fromIndex;
  const match = re.exec(content);
  if (!match) return null;

  const start = match.index;
  const openBrace = content.indexOf('{', start);
  let depth = 0;

  for (let i = openBrace; i < content.length; i += 1) {
    const char = content[i];
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;

    if (depth === 0) {
      return { start, openBrace, end: i + 1, text: content.slice(start, i + 1) };
    }
  }

  return null;
}

function replaceNamedBlock(content, blockName, replacement, fromIndex = 0) {
  const block = findNamedBlock(content, blockName, fromIndex);
  if (!block) return null;
  return content.slice(0, block.start) + replacement + content.slice(block.end);
}

function addSigningConfig(content) {
  const androidBlock = findNamedBlock(content, 'android');
  if (!androidBlock) return content;

  const signingConfig = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            // Release APK is intentionally signed with a generated debug keystore in CI.
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }`;

  const withSigningConfigs = replaceNamedBlock(content, 'signingConfigs', signingConfig, androidBlock.openBrace);
  if (withSigningConfigs) {
    content = withSigningConfigs;
  } else {
    content = content.slice(0, androidBlock.openBrace + 1) + `\n${signingConfig}` + content.slice(androidBlock.openBrace + 1);
  }

  const buildTypesBlock = findNamedBlock(content, 'buildTypes', androidBlock.openBrace);
  const releaseBlock = buildTypesBlock ? findNamedBlock(content, 'release', buildTypesBlock.openBrace) : null;
  if (!releaseBlock) return content;

  let releaseText = releaseBlock.text;
  if (/signingConfig\s+signingConfigs\.[a-zA-Z]+/.test(releaseText)) {
    releaseText = releaseText.replace(/signingConfig\s+signingConfigs\.[a-zA-Z]+/, 'signingConfig signingConfigs.release');
  } else {
    releaseText = releaseText.replace(/release\s*\{/, 'release {\n            signingConfig signingConfigs.release');
  }

  return content.slice(0, releaseBlock.start) + releaseText + content.slice(releaseBlock.end);
}
