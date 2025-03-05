import { useNavigate } from "react-router-dom";
import React, { useMemo, useState } from "react";
import styles from "./home.module.scss";
import Entry from "./components/Entry";

export default function Home() {
  interface File {
    name: string;
    path: string;
  }

  const navigate = useNavigate();
  const [directory, setDirectory] = useState<string | null>(null);

  const memories = [
    {
      date: "Dec 2, 2024",
      location: "Providence, RI, USA",
      image: "image.png",
    },
    {
      date: "Dec 2, 2024",
      location: "Providence, RI, USA",
      image: "image.png",
    },
    {
      date: "Dec 2, 2024",
      location: "Providence, RI, USA",
      image: "image.png",
    },
    {
      date: "Dec 2, 2024",
      location: "Providence, RI, USA",
      image: "image.png",
    },
    {
      date: "Dec 2, 2024",
      location: "Providence, RI, USA",
      image: "image.png",
    },
  ];

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
        </div>
        <div className={styles.navgroup}>
          <div className={styles.nav}>how to</div>
          <div className={styles.nav}>memories</div>
        </div>
      </div>

      {/* <div>december 2024</div> */}
      <button onClick={handleChooseDirectory}>Choose Directory</button>
      <div>
        {txtFiles.map((file) => {
          const baseName = file.path
            ? (file.path.split("\\").pop() ?? "").replace(".txt", "")
            : "";
          const image = images.find(
            (img) => img.name.replace(/\.[^/.]+$/, "") === baseName
          );
          console.log(image);
          return <Entry key={file.path} file={file} image={image} />;
        })}
      </div>

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
