import React from "react";
import styles from "./TimelineScrollbar.module.scss";

interface ParsedEntry {
  path: string;
  utctime: string;
}

const TimelineScrollbar = ({
  parsedEntries,
}: {
  parsedEntries: ParsedEntry[];
}) => {
  const filesByMonth = parsedEntries.reduce((acc, entry) => {
    // console.log(entry);
    if (!entry.utctime) return acc;

    const date = new Date(entry.utctime);
    const monthKey = date.toLocaleString("default", {
      year: "numeric",
      month: "short",
    });

    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(entry.path);

    return acc;
  }, {} as Record<string, string[]>);

  const scrollToFile = (filePath: string) => {
    const element = document.querySelector(`[data-file-path="${filePath}"]`);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={styles.scrollbar}>
      {Object.entries(filesByMonth).map(([month, files]) => (
        <div
          key={month}
          className={styles.monthMarker}
          onClick={() => scrollToFile(files[0])}
        >
          {month}
        </div>
      ))}
    </div>
  );
};

export default TimelineScrollbar;
