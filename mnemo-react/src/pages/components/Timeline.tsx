import React, { useState } from "react";
import TxtFileComponent from "./TxtFileComponent";

interface TxtFile {
  name: string;
  path: string;
}

const App: React.FC = () => {
  const [txtFiles, setTxtFiles] = useState<TxtFile[]>([]);

  const handleChooseDirectory = async () => {
    const files = await window.electron.selectDirectory();

    if (!files || files.length === 0) {
      console.warn("No files selected or directory is empty.");
      setTxtFiles([]);
      return;
    }

    setTxtFiles(files);
  };

  return (
    <div>
      <button onClick={handleChooseDirectory}>Choose Directory</button>
      <div>
        {txtFiles.map((file) => (
          <TxtFileComponent key={file.path} file={file} />
        ))}
      </div>
    </div>
  );
};

export default App;
