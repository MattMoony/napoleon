const { app, BrowserWindow, ipcMain } = require('electron');
const ytdl = require('youtube-dl');
const fs = require('fs');
const path = require('path');
const os = require('os');

function createWindow() {
  let win = new BrowserWindow({
    width: 800,
    minWidth: 800,
    height: 600,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
    },
    frame: false,
  });
  win.setMenuBarVisibility(false);
  // win.openDevTools();
  win.loadFile(path.resolve(__dirname, 'public', 'index.html'));
}

ipcMain.on('download', (event, url) => {
  const vid = ytdl(url);
  let downloaded = 0;
  let total = 0;

  vid.on('info', info => {
    total = info.size;
  });

  vid.on('data', chunk => {
    downloaded += chunk.length;
    event.reply('downloading', (downloaded /total * 100).toFixed(2));
  });

  vid.on('end', info => {
    event.reply('finished');
  });

  vid.pipe(fs.createWriteStream(path.resolve(os.homedir(), 'Desktop', url.slice(-11) + '.mp4')));
});

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

app.whenReady().then(createWindow);