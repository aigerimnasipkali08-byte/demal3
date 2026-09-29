import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('postureLockAPI', {
  setLockMode: (locked: boolean) => ipcRenderer.invoke('set-lock-mode', locked),
  isElectron: true,
});
