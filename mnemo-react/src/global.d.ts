export {};

declare global {
  interface Window {
    electron: {
      selectDirectory: () => Promise<{
        files: { name: string; path: string }[];
        images: { name: string; path: string }[];
      }>;
      readFile: (filePath: string) => Promise<string>;
    };
    api: {
      checkResponseFile: (fileName: string) => Promise<string | null>;
      askChatGPTWithImage: (
        imagePath: string,
        prompt: string
      ) => Promise<string>;
    };
  }
}
