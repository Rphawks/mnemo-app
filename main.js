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
require("dotenv").config();
const sharp = require('sharp');
const { encoding_for_model } = require('@dqbd/tiktoken');


let win;
let dirPath;

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
  protocol.handle("image-protocol", async (request) => {
    let filePath = request.url.replace("image-protocol://", "");
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

  dirPath = result.filePaths[0];
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

  return { files, images };
});

ipcMain.handle("read-file", async (_event, filePath) => {
  return fs.readFileSync(filePath, "utf-8");
});

ipcMain.handle("check-response-file", async (_, fileName) => {
  const filePath = path.join(dirPath, "responses", `${fileName}.txt`);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;
});

ipcMain.handle("ask-chatgpt-with-image", async (_, imagePath, prompt) => {
  const API_KEY = process.env.OPENAI_API_KEY;
  const API_URL = "https://api.openai.com/v1/chat/completions";
  const fileName = `${path.basename(imagePath, path.extname(imagePath))}`;
  const filePath = path.join(dirPath, "responses", `${fileName}.txt`);
  console.log(filePath);

  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf8");
  }

  try {
    // Read and encode image
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    // ⏱ Estimate image size
    const metadata = await sharp(imageBuffer).metadata();
    const imageResolution = Math.max(metadata.width || 0, metadata.height || 0);
    
    // Vision model specific token estimation
    // Base tokens for vision model processing
    let estimatedImageTokens = 85; // Base cost for any image
    
    // Add tokens based on image size (vision models use a different tokenization scheme)
    const imageSize = imageBuffer.length;
    // Vision models typically use more tokens for high-resolution images
    if (imageResolution > 2048) {
      estimatedImageTokens += 2000;
    } else if (imageResolution > 1024) {
      estimatedImageTokens += 1000;
    } else if (imageResolution > 512) {
      estimatedImageTokens += 500;
    } else {
      estimatedImageTokens += 250;
    }
    
    // Add tokens for base64 encoding overhead
    estimatedImageTokens += Math.ceil(imageSize * 0.33 / 4);

    // Add tokens for JSON structure and metadata
    const metadataTokens = 100; // Vision models typically use more metadata tokens
    
    const totalEstimatedTokens = estimatedImageTokens + metadataTokens;

    console.log("Estimated Token Usage:");
    console.log(`  Image tokens:  ${estimatedImageTokens}`);
    console.log(`  Metadata tokens: ${metadataTokens}`);
    console.log(`  Total:         ${totalEstimatedTokens}`);

    // ⏱ Estimate prompt tokens
    const enc = encoding_for_model("gpt-4");  // Use gpt-4 for text token estimation
    const promptTokenCount = enc.encode(prompt).length;
    enc.free();

    // Add tokens for JSON structure and metadata
    const metadataTokensPrompt = 50; // Approximate tokens for JSON structure and metadata
    
    const totalEstimatedTokensPrompt = promptTokenCount + estimatedImageTokens + metadataTokensPrompt;

    console.log("Estimated Token Usage:");
    console.log(`  Prompt tokens: ${promptTokenCount}`);
    console.log(`  Image tokens:  ${estimatedImageTokens}`);
    console.log(`  Metadata tokens: ${metadataTokens}`);
    console.log(`  Total:         ${totalEstimatedTokensPrompt}`);

    console.log("Prompt:", prompt);

    // 🔄 Send request
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                },
              },
            ],
          },
        ],
        max_tokens: 600,
      }),
    });

    const data = await response.json();

    // ✅ Print actual token usage
    if (data.usage) {
      console.log("\n Actual Token Usage:");
      console.log(`  Prompt:     ${data.usage.prompt_tokens}`);
      console.log(`  Completion: ${data.usage.completion_tokens}`);
      console.log(`  Total:      ${data.usage.total_tokens}`);
    }

    const outputText =
      Array.isArray(data.choices) && data.choices.length > 0
        ? data.choices[0].message?.content || "No response from AI"
        : `API Error: ${JSON.stringify(data)}`;

    if (!fs.existsSync(path.join(dirPath, "responses"))) {
      fs.mkdirSync(path.join(dirPath, "responses"));
    }
    fs.writeFileSync(filePath, outputText, "utf8");

    return outputText;
  } catch (error) {
    return `Error: ${error}`;
  }
});
