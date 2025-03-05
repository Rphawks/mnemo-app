const {
  app,
  BrowserWindow,
  screen,
  dialog,
  ipcMain,
  protocol,
} = require("electron");
const path_node = require("node:path");
const fs = require("fs");
const path = require("path");

let win;

const createWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    // width: width,
    // height: height,
    // resizable: false,
    webPreferences: {
      preload: path_node.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // win.loadFile("index.html");
  // const startUrl =
  //   process.env.ELECTRON_START_URL ||
  //   `file://${path.join(__dirname, "/mnemo-react/index.html")}`;

  // win.loadURL(startUrl);

  const oldHeight = height;
  const aspectRatio = 16 / 9;
  win.on("resize", () => {
    const [width, height] = win.getSize();
    let newWidth = width;
    let newHeight = Math.round(width / aspectRatio);

    if (newHeight > height) {
      newHeight = height;
      newWidth = Math.round(height * aspectRatio);
    }

    win.setSize(newWidth, newHeight);
    win.webContents.setZoomFactor(newHeight / oldHeight);
  });

  win.setAspectRatio(16 / 9);
  win.setBounds({ x: 0, y: 0, width, height });
  win.maximize();
  win.loadURL("http://localhost:5173");
};

app.whenReady().then(() => {
  protocol.handle("my-protocol", async (request) => {
    let filePath = request.url.replace("my-protocol://", "");
    filePath = decodeURIComponent(filePath);

    try {
      const data = fs.readFileSync(filePath);
      const mimeType = "image/jpeg";

      return new Response(data, {
        headers: { "Content-Type": mimeType },
      });
    } catch (error) {
      console.error("Failed to read file:", error);
      return new Response("File not found", { status: 404 });
    }
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("select-directory", async () => {
  // console.log("Opening dialog...");
  const result = await dialog.showOpenDialog(win, {
    properties: ["openDirectory"],
  });

  // console.log("Dialog result:", result);

  if (result.canceled) {
    console.warn("User canceled directory selection.");
    return [];
  }

  const dirPath = result.filePaths[0];
  const files = fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith(".txt"))
    .map((file) => ({
      name: file,
      path: path.join(dirPath, file),
    }));

  const imagesDir = path.join(dirPath, "images");
  let images = [];

  if (fs.existsSync(imagesDir) && fs.statSync(imagesDir).isDirectory()) {
    images = fs
      .readdirSync(imagesDir)
      .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map((file) => ({
        name: file,
        path: path.join(imagesDir, file),
      }));
  } else {
    console.warn(`No 'images' folder found in ${dirPath}`);
  }

  // console.log("Text files found:", files);
  // console.log("Images found:", images);

  return { files, images };
});

ipcMain.handle("read-file", async (_event, filePath) => {
  return fs.readFileSync(filePath, "utf-8");
});
