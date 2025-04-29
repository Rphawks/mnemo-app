const { contextBridge, ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});

contextBridge.exposeInMainWorld("electron", {
  selectDirectory: () => ipcRenderer.invoke("select-directory"),
  readFile: (filePath) => ipcRenderer.invoke("read-file", filePath),
});

contextBridge.exposeInMainWorld("api", {
  checkResponseFile: (fileName) =>
    ipcRenderer.invoke("check-response-file", fileName),
  askChatGPTWithImage: (imagePath, prompt) =>
    ipcRenderer.invoke("ask-chatgpt-with-image", imagePath, prompt),
});
