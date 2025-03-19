import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { autoUpdater } from 'electron-updater';
import Store from 'electron-store';

const store = new Store();

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Check for updates
  autoUpdater.checkForUpdatesAndNotify();

  // Handle update events
  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update-available');
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update-downloaded');
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for machine control
ipcMain.handle('restart-machine', async (event, machineId) => {
  // Implement machine restart logic
});

ipcMain.handle('update-machine', async (event, machineId) => {
  // Implement machine update logic
});

// Store settings
ipcMain.handle('get-settings', () => {
  return store.get('settings');
});

ipcMain.handle('set-settings', (event, settings) => {
  store.set('settings', settings);
});

// Install updates
ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall();
});