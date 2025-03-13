import { useEffect, useMemo, useState } from "react";
import styles from "./timeline.module.scss";
import Entry from "./Entry";
import TimelineScrollbar from "./TimelineScrollbar";

interface File {
  name: string;
  path: string;
}

interface Props {
  txtFiles: File[];
  images: File[];
}

interface ParsedEntry {
  path: string;
  utctime: string;
}

const Timeline: React.FC<Props> = ({ txtFiles, images }) => {
  const [parsedEntries, setParsedEntries] = useState<ParsedEntry[]>([]);

  const handleParsedDate = (path: string, utctime: string) => {
    setParsedEntries((prev) => {
      const updated = prev.filter((entry) => entry.path !== path);
      updated.push({ path, utctime });
      return updated;
    });
  };

  const allParsed = useMemo(() => {
    return txtFiles.every((file) =>
      parsedEntries.some((entry) => entry.path === file.path)
    );
  }, [txtFiles, parsedEntries]);

  const filesWithDates = useMemo(() => {
    return txtFiles.map((file) => {
      const parsedEntry = parsedEntries.find(
        (entry) => entry.path === file.path
      );
      return {
        file,
        dateObj: parsedEntry ? new Date(parsedEntry.utctime) : null,
      };
    });
  }, [parsedEntries, txtFiles]);

  const filesByMonth = useMemo(() => {
    return filesWithDates.reduce((acc, { file, dateObj }) => {
      if (!dateObj || isNaN(dateObj.getTime())) {
        if (!acc["Pending"]) acc["Pending"] = [];
        acc["Pending"].push(file);
        return acc;
      }

      const monthLabel = dateObj.toLocaleString("default", {
        year: "numeric",
        month: "long",
      });

      if (!acc[monthLabel]) acc[monthLabel] = [];
      acc[monthLabel].push(file);
      return acc;
    }, {} as Record<string, File[]>);
  }, [filesWithDates]);

  const imageMap = useMemo(() => {
    const map = new Map<string, File>();
    images.forEach((img) => {
      const baseName = img.name.replace(/\.[^/.]+$/, "");
      map.set(baseName, img);
    });
    return map;
  }, [images]);

  if (!allParsed) {
    // Render initial view where each file gets processed (unsorted)
    return (
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
              isInitialParse={true}
            />
          );
        })}
        <TimelineScrollbar parsedEntries={parsedEntries} />
      </div>
    );
  }

  return (
    <div className={styles.timelineWrapper}>
      <div id="timeline" className={styles.timeline}>
        {Object.entries(filesByMonth).map(([month, files]) => (
          <div key={month}>
            <h3>{month}</h3>
            <div className={styles.monthSection}>
              {files.map((file) => {
                const baseName =
                  file.path.split("\\").pop()?.replace(".txt", "") ?? "";
                const image = imageMap.get(baseName);

                return (
                  <Entry
                    key={file.path}
                    file={file}
                    image={image}
                    onParsedDate={handleParsedDate}
                    isInitialParse={false}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <TimelineScrollbar parsedEntries={parsedEntries} />
    </div>
  );
};

export default Timeline;
