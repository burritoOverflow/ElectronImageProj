const path = require("path");
const os = require("os");

const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const imagemin = require("imagemin");
const imageminMozJpeg = require("imagemin-mozjpeg");
const imageminPngQuant = require("imagemin-pngquant");
const slash = require("slash");
const log = require("electron-log");

// set environment
process.env.NODE_ENV = "production";

// environment determinations
const isDev = process.env.NODE_ENV === "development" ? true : false;
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
    width: 700,
    height: 605,
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
ipcMain.on("image:minimize", (e, options) => {
  options.dest = path.join(os.homedir(), "/imageshrink");
  shrinkImage(options);
});

async function shrinkImage({ imgPath, quality, dest }) {
  if (!validateExtensions(imgPath)) {
    log.error("Invalid Extension Provided");
    mainWindow.webContents.send("invalidinput");
    return;
  }

  try {
    const pngQuality = quality / 100;
    const files = await imagemin([slash(imgPath)], {
      destination: dest,
      plugins: [
        imageminMozJpeg({ quality }),
        imageminPngQuant([pngQuality, pngQuality]),
      ],
    });
    shell.openPath(dest);
    mainWindow.webContents.send("image:done");
    log.info(files);
  } catch (error) {
    log.error(error);
  }
}

// *nix only
function validateExtensions(fullPath) {
  const validExtensions = [".jpg", ".jpeg", ".png"];
  const extension = fullPath.slice(fullPath.indexOf("."), fullPath.length);

  if (validExtensions.includes(extension)) {
    return true;
  } else {
    return false;
  }
}

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
