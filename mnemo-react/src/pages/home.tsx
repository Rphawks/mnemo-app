import { useNavigate } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import styles from "./home.module.scss";
import Entry from "./components/Entry";
import TimelineScrollbar from "./components/TimelineScrollbar";
import Timeline from "./components/Timeline";

export default function Home() {
  interface File {
    name: string;
    path: string;
  }

  // const navigate = useNavigate();
  // const [directory, setDirectory] = useState<string | null>(null);

  const [txtFiles, setTxtFiles] = useState<File[]>([]);
  const [images, setImages] = useState<File[]>([]);

  const handleChooseDirectory = async () => {
    const { files, images } = await window.electron.selectDirectory();
    setTxtFiles(files);
    setImages(images);
  };

  return (
    <div className={styles.timelineContainer}>
      <div className={styles.topbox}>
        <div className={styles.logobox}>
          <div className={styles.logo} />
          <div className={styles.brand}>mnemo</div>
          <button
            className={styles.directorybutton}
            onClick={handleChooseDirectory}
          >
            choose directory
          </button>
        </div>
        <div className={styles.navgroup}>
          <div className={styles.nav}>how to</div>
          <div className={styles.nav}>memories</div>
        </div>
      </div>
      {/* 
      <div className={styles.timeline}>
        {txtFiles.map((file) => {
          const baseName = file.path
            ? (file.path.split("\\").pop() ?? "").replace(".txt", "")
            : "";
          const image = images.find(
            (img) => img.name.replace(/\.[^/.]+$/, "") === baseName
          );

          return (
            <Entry
              key={file.path}
              file={file}
              image={image}
              onParsedDate={handleParsedDate}
            />
          );
        })}
      </div> */}
      {/* <div className={styles.timeline}>
        {!allParsed
          ? // Initial unsorted render
            txtFiles.map((file) => {
              const baseName = file.path
                ? (file.path.split("\\").pop() ?? "").replace(".txt", "")
                : "";
              const image = images.find(
                (img) => img.name.replace(/\.[^/.]+$/, "") === baseName
              );
              return (
                <Entry
                  key={file.path}
                  file={file}
                  image={image}
                  onParsedDate={handleParsedDate}
                />
              );
            })
          : // Sorted grouped view once parsing is complete
            Object.entries(filesByMonth).map(([month, files]) => (
              <div key={month} className="monthSection">
                <h3>{month}</h3>
                {files.map((file) => {
                  const baseName = file.path
                    ? (file.path.split("\\").pop() ?? "").replace(".txt", "")
                    : "";
                  const image = images.find(
                    (img) => img.name.replace(/\.[^/.]+$/, "") === baseName
                  );
                  return (
                    <Entry
                      key={file.path}
                      file={file}
                      image={image}
                      onParsedDate={handleParsedDate}
                    />
                  );
                })}
              </div>
            ))}
        <TimelineScrollbar parsedEntries={parsedEntries} />
      </div> */}
      <Timeline txtFiles={txtFiles} images={images}></Timeline>

      {/* <div className={styles.yearMarker}>2024</div>
      <div className={styles.yearMarker}>2023</div>
      <div className={styles.yearMarker}>2021</div>
      <main className={styles.mainContent}>
        <section className={styles.memoryGrid}>
          {memories.map((memory, index) => (
            <div key={index} className={styles.memoryCard}>
              <img
                src={memory.image}
                alt="Memory"
                className={styles.memoryImage}
              />
              <div className={styles.memoryDetails}>
                <span className={styles.memoryDate}>{memory.date}</span>
                <span className={styles.memoryLocation}>{memory.location}</span>
              </div>
            </div>
          ))}
        </section>
      </main> */}
    </div>
  );
}
