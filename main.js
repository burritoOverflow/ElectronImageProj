const { app, BrowserWindow, Menu, ipcMain } = require("electron");

// set environment
process.env.NODE_ENV = "development";

// environment determinations
const isDev = process.env.NODE_ENV == "development" ? true : false;
const isMac = process.platform === "darwin" ? true : false;

let mainWindow;
let aboutWindow;

const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  {
    role: "fileMenu",
  },
  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            // { type: "seperator" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),
];

// primary UI
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "ImageShrink",
    width: 1000,
    height: 506,
    icon: "./assets/icons/Icon_256x256.png",
    resizable: isDev ? true : false, // allow resizing only in development
    backgroundColor: "white",
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/app/index.html`);

  // open dev tools automatically if dev
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// on submit via form event: from renderer to main
ipcMain.on("image:minimize", (e, options) => {});

function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: "About",
    width: 300,
    height: 300,
    icon: "./assets/icons/Icon_256x256.png",
    resizable: false,
  }).loadURL(`file://${__dirname}/app/about.html`);
}

app.on("ready", () => {
  createMainWindow();
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);
  //   mainWindow.on("ready", () => (mainWindow = null));
});

app.on("window-all-closed", () => {
  // Maintain typical mac behavior
  if (!isMac) {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
