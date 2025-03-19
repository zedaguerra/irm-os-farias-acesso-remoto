/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  appId: 'com.irmaosfarias.app',
  productName: 'Irmãos Farias',
  directories: {
    output: 'release'
  },
  files: [
    'dist/**/*',
    'dist-electron/**/*'
  ],
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64']
      }
    ],
    icon: 'build/icon.ico'
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Irmãos Farias'
  },
  mac: {
    target: ['dmg'],
    icon: 'build/icon.icns'
  },
  linux: {
    target: ['AppImage'],
    icon: 'build/icon.png'
  },
  publish: {
    provider: 'github',
    owner: 'irmaosfarias',
    repo: 'marketplace-monitor'
  }
};

module.exports = config;