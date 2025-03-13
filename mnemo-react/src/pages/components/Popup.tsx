import React from "react";
import styles from "./popup.module.scss";

interface PopupData {
  imagePath: string | null;
  utcTime: string;
  gps: string | null;
  filePath: string;
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

const Popup = ({ data, onClose }: PopupProps) => {
  if (!data) return null;

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent}>
        <button onClick={onClose} className={styles.closeButton}>
          Close
        </button>

        {data.imagePath ? (
          <img src={data.imagePath} className={styles.popupImage} />
        ) : (
          <div className={styles.placeholderImage}>No Image Available</div>
        )}

        <div className={styles.popupDetails}>
          <span className={styles.popupDate}>{formatDate(data.utcTime)}</span>
          <br />
          <span className={styles.popupLocation}>
            {data.gps ?? "No Location"}
          </span>
          <br />
          <span className={styles.popupFilePath}>{data.filePath}</span>
        </div>
      </div>
    </div>
  );
};

export default Popup;
