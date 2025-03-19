import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  // Machine control
  restartMachine: (machineId: string) => ipcRenderer.invoke('restart-machine', machineId),
  updateMachine: (machineId: string) => ipcRenderer.invoke('update-machine', machineId),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSettings: (settings: any) => ipcRenderer.invoke('set-settings', settings),
  
  // Updates
  installUpdate: () => ipcRenderer.invoke('install-update'),
  
  // Event listeners
  onUpdateAvailable: (callback: () => void) => {
    ipcRenderer.on('update-available', callback);
    return () => ipcRenderer.removeListener('update-available', callback);
  },
  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.on('update-downloaded', callback);
    return () => ipcRenderer.removeListener('update-downloaded', callback);
  }
});