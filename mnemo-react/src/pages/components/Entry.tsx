import React, { useEffect, useState } from "react";
import styles from "./entry.module.scss";
import Popup from "./Popup";

interface File {
  name: string;
  path: string;
}

interface Props {
  file: File;
  image?: File | null;
  onParsedDate: (path: string, utctime: string) => void;
  isInitialParse: boolean;
}

const formatDate = (utcString: string): string => {
  if (!utcString) return "";
  const date = new Date(utcString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const parseSensorData = (data: string) => {
  const lines = data.split("\n");
  const parsedData: Record<string, string> = {};

  lines.forEach((line) => {
    const match = line.match(/(.+?)\s*=\s*(.+)/);
    if (match) {
      const key = match[1].trim();
      let value = match[2];

      // if (!isNaN(parseFloat(value))) value = parseFloat(value).toString();

      parsedData[key] = value;
    }
  });

  return parsedData;
};

const Entry: React.FC<Props> = ({
  file,
  image,
  onParsedDate,
  isInitialParse,
}) => {
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    window.electron.readFile(file.path).then(setContent);
  }, [file.path]);

  const [utcTime, setUtcTime] = useState<string>("");
  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [no2, setNo2] = useState<number | null>(null);
  const [c2h5oh, setC2h5oh] = useState<number | null>(null);
  const [voc, setVoc] = useState<number | null>(null);
  const [co, setCo] = useState<number | null>(null);
  const [gps, setGps] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);

  useEffect(() => {
    if (image) {
      setImagePath(`my-protocol://${encodeURIComponent(image.path)}`);
    } else {
      setImagePath(null);
    }
  }, [image]);

  useEffect(() => {
    if (content) {
      const parsedData = parseSensorData(content);

      setUtcTime(parsedData["UTC Time"] || "");
      setTemperature(
        parsedData["Temperature"] ? parseFloat(parsedData["Temperature"]) : null
      );
      setHumidity(
        parsedData["Humidity"] ? parseFloat(parsedData["Humidity"]) : null
      );
      setNo2(parsedData["NO2"] ? parseFloat(parsedData["NO2"]) : null);
      setC2h5oh(parsedData["C2H5OH"] ? parseFloat(parsedData["C2H5OH"]) : null);
      setVoc(parsedData["VOC"] ? parseFloat(parsedData["VOC"]) : null);
      setCo(parsedData["CO"] ? parseFloat(parsedData["CO"]) : null);
      setGps(parsedData["GPS"] || "No Location");
    }
  }, [content]);

  useEffect(() => {
    if (isInitialParse && utcTime) {
      try {
        onParsedDate(file.path, utcTime);
      } catch (error) {
        console.error("Failed to read file", file.path, error);
      }
    }
  }, [utcTime, isInitialParse]);

  interface PopupData {
    imagePath: string | null;
    utcTime: string;
    gps: string | null;
    filePath: string;
  }

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupData, setPopupData] = useState<PopupData | null>(null);

  const handleClick = () => {
    setPopupData({
      imagePath,
      utcTime,
      gps,
      filePath: file.path,
    });
    setIsPopupVisible(true);
  };

  return (
    <div>
      <div
        className={styles.memoryCard}
        data-file-path={file.path.split(/[/\\]/).pop()}
        onClick={handleClick}
      >
        {imagePath && <img src={imagePath} className={styles.memoryImage} />}
        <div className={styles.memoryDetails}>
          <span className={styles.memoryDate}>{formatDate(utcTime)}</span>
          <br></br>
          <span className={styles.memoryLocation}>{gps}</span>
        </div>
      </div>
      {isPopupVisible && (
        <Popup data={popupData} onClose={() => setIsPopupVisible(false)} />
      )}
    </div>
  );
};

export default Entry;
