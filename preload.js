const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dockedDesktop', Object.freeze({
  openSignInSuccess: () => ipcRenderer.invoke('docked:open-signin-success'),
  continueToAccount: () => ipcRenderer.invoke('docked:continue-to-account')
}));