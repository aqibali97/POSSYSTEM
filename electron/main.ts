import { app, BrowserWindow, shell } from 'electron';
import { join } from 'path';

// Fix: Add type declarations for Node.js globals to resolve TypeScript errors.
// These are available in the Electron main process environment.
declare const require: (module: string) => any;
declare const __dirname: string;
declare const process: {
  platform: string;
};

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const isDev = !app.isPackaged;

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the index.html of the app.
  if (isDev) {
    // In development, load from the Vite dev server. Assumes Vite runs on default port 5173.
    // If your port is different, change it here.
    mainWindow.loadURL('http://localhost:5173');
    // Open the DevTools automatically in development.
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built index.html file.
    mainWindow.loadFile(join(__dirname, '..', '..', 'dist', 'index.html'));
  }

  // Open links in the default browser instead of a new Electron window.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create a window when the dock icon is clicked
  // and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
