import React, { useEffect, useState } from "react";
import styles from "./popup.module.scss";

interface PopupData {
  imagePath: string | null;
  utcTime: string;
  gps: string | null;
  filePath: string;
  temperature: number | null;
  humidity: number | null;
}

interface PopupProps {
  data: PopupData | null;
  onClose: () => void;
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

const formatDateShort = (utcString: string): string => {
  if (!utcString) return "";
  const date = new Date(utcString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
};

function formatUTCString(utcString: string): string {
  const date = new Date(utcString);
  return date.toISOString().slice(11, 19) + " UTC";
}

function formatUTCToEasternHour(utcString: string): string {
  const date = new Date(utcString);

  // Convert to Eastern Time (ET)
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    hour12: true,
    timeZone: "America/New_York",
  };

  return new Intl.DateTimeFormat("en-US", options).format(date);
}

const Popup = ({ data, onClose }: PopupProps) => {
  if (!data) return null;

  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const isFetchingRef = React.useRef(false);
  const hardCodedPrompt = `Given this data about the photo, can you write a one-sentence summary? 
  Only include what you think is significant and omit numbers from the final response.
  Please try to guess the specific city or town of the photo in the response.
  Do not refer to the photo (e.g. "the photo shows"). Avoid unconfident language.
  Date: ${data.utcTime}
  GPS: ${data.gps}
  Temperature: ${data.temperature}°C
  Humidity: ${data.humidity} RH
  `;

  useEffect(() => {
    if (data && !isFetchingRef.current) {
      isFetchingRef.current = true;
      fetchResponse();
    }

    return () => {
      isFetchingRef.current = false;
    };
  }, [data]);

  const fetchResponse = async () => {
    if (!data?.imagePath) return;

    const fileName = data.imagePath
      .replace(/images/, "responses")
      .replace(/\.[^/.]+$/, ".txt");
    console.log(fileName);

    // Check for existing cached response file
    const cachedResponse = await window.api.checkResponseFile(fileName);
    if (cachedResponse) {
      setResponse(cachedResponse);
      isFetchingRef.current = false;
      return;
    }

    // If no cached response, make the request
    setLoading(true);
    let cleanImagePath = decodeURIComponent(data.imagePath);
    cleanImagePath = cleanImagePath.replace(/^image-protocol:\/\//, "");
    console.log(cleanImagePath);

    const result = await window.api.askChatGPTWithImage(
      decodeURIComponent(cleanImagePath),
      hardCodedPrompt
    );
    setResponse(result);
    setLoading(false);
    isFetchingRef.current = false;
  };

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupFlex}>
        <div className={styles.popupContent}>
          {data.imagePath ? (
            <img src={data.imagePath} className={styles.popupImage} />
          ) : (
            <div className={styles.placeholderImage}>No Image Available</div>
          )}
          <div className={styles.mnemoText}>memory captured by mnemo</div>

          <div className={styles.popupDetails}>
            <div className={styles.popupDataTitle}>Data</div>
            <span className={styles.popupDate}>
              {formatDateShort(data.utcTime)}
            </span>
            <br />
            <span className={styles.popupTime}>
              {formatUTCString(data.utcTime)}
            </span>
            <br />
            <span className={styles.popupLocation}>
              {data.gps ?? "No Location"}
            </span>
            <br />
            <span className={styles.popupLocation}>
              {data.temperature != null
                ? `${Math.trunc(data.temperature * 100) / 100}°C`
                : "No Temperature"}
            </span>
            <br />
            <span className={styles.popupLocation}>
              {data.humidity != null
                ? `${Math.trunc(data.humidity)}% RH`
                : "No Humidity"}
            </span>
            <br />
            <span className={styles.popupFilePath}>{data.filePath}</span>
          </div>
        </div>
        <div className={styles.popupText}>
          <span className={styles.popupDateLong}>
            {formatDate(data.utcTime)}
            <br />
            {formatUTCToEasternHour(data.utcTime)}
          </span>
          <div className={styles.popupLocationLong}>
            {data.gps ?? "No Location"}
          </div>
          <div className={styles.GPTResponse}>
            {loading && <div>Loading...</div>}
            {response && <div className={styles.response}>{response}</div>}
          </div>
        </div>
      </div>

      <button onClick={onClose} className={styles.closeButton}>
        memories
      </button>
    </div>
  );
};

export default Popup;
