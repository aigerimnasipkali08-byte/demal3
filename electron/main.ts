import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;
let isLocked = false;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 650,
    title: 'PostureLock',
    frame: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  const devUrl = 'http://localhost:3000';
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL(devUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers for Lockscreen Control
ipcMain.handle('set-lock-mode', (event, lock: boolean) => {
  if (!mainWindow) return false;
  isLocked = lock;

  if (isLocked) {
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    mainWindow.setKiosk(true);
    mainWindow.setFullScreen(true);
    mainWindow.setResizable(false);
    mainWindow.setMovable(false);

    // Block common exit shortcuts in kiosk mode
    globalShortcut.register('Alt+Tab', () => false);
    globalShortcut.register('Alt+F4', () => false);
  } else {
    globalShortcut.unregister('Alt+Tab');
    globalShortcut.unregister('Alt+F4');

    mainWindow.setAlwaysOnTop(false);
    mainWindow.setKiosk(false);
    mainWindow.setFullScreen(false);
    mainWindow.setResizable(true);
    mainWindow.setMovable(true);
  }

  return isLocked;
});

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
