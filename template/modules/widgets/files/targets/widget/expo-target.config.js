// iOS widget target — lives outside ios/, survives `expo prebuild --clean` (@bacons/apple-targets).
// Rename the App Group in app.json (ios.entitlements) and widgets/shared.ts together.
/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'widget',
  name: 'Countdown',
  bundleIdentifier: '.widget',
  deploymentTarget: '17.0',
  entitlements: { 'com.apple.security.application-groups': config.ios.entitlements['com.apple.security.application-groups'] },
  colors: { $accent: '#1E6B4A', $widgetBackground: { light: '#FFFFFF', dark: '#111614' } },
});
