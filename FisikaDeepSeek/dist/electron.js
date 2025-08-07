const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

// Отключаем меню в production
if (!isDev) {
  Menu.setApplicationMenu(null);
}

function createWindow() {
  // Создаем окно браузера
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    icon: path.join(__dirname, 'icon.png'), // Иконка приложения
    show: false, // Не показываем окно пока не загрузится
    titleBarStyle: 'default',
    autoHideMenuBar: !isDev // Скрываем меню в production
  });

  // Загружаем приложение
  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Показываем окно когда готово
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Открываем DevTools только в development
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Обработка закрытия окна
  mainWindow.on('closed', () => {
    app.quit();
  });

  // Предотвращаем навигацию на внешние сайты
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== startUrl) {
      event.preventDefault();
    }
  });
}

// Этот метод будет вызван когда Electron закончит инициализацию
app.whenReady().then(createWindow);

// Выходим когда все окна закрыты
app.on('window-all-closed', () => {
  // На macOS приложения обычно остаются активными пока пользователь не выйдет явно
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // На macOS пересоздаем окно когда иконка в dock нажата
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Безопасность: предотвращаем создание новых окон
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});