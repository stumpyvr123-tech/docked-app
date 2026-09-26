const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    // Add this line to set the window titlebar/dock logo:
    icon: path.join(__dirname, 'build', 'D.png'), 
    webPreferences: {
      nodeIntegration: true,
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);
